// auth-google-callback.js
const axios     = require('axios');
const qs        = require('querystring');
const { OAuth2Client } = require('google-auth-library');
const AWS       = require('aws-sdk');
const jwt       = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const db     = new AWS.DynamoDB.DocumentClient();
const TABLE  = process.env.USERS_TABLE;

// Verify Google ID token
async function verifyIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

exports.handler = async (event) => {
  try {
    const code = event.queryStringParameters?.code;
    if (!code) throw new Error('Missing code');

    // 1) Exchange code for tokens
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      qs.stringify({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri:  process.env.GOOGLE_REDIRECT_URI,
        grant_type:    'authorization_code',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { id_token } = tokenRes.data;

    // 2) Verify ID token payload
    const { sub, email, name } = await verifyIdToken(id_token);
    const pk = `USER#${sub}`;

    // 3) Get-or-create user in DynamoDB
    const getRes = await db.get({
      TableName: TABLE,
      Key: { pk }
    }).promise();

    let user = getRes.Item;
    if (!user) {
      user = { pk, sub, email, name, createdAt: new Date().toISOString() };
      await db.put({
        TableName: TABLE,
        Item: user
      }).promise();
    }

    // 4) Issue your own JWT
    const token = jwt.sign({ sub, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // 5) Return via cookie and/or JSON
    return {
      statusCode: 302,
      headers: {
        'Set-Cookie': `session=${token}; HttpOnly; Secure; Path=/; Max-Age=${7*24*60*60}`,
        'Location': '/',  // redirect home (or wherever)
      },
      body: '',
    };

  } catch (err) {
    console.error('Callback error:', err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
