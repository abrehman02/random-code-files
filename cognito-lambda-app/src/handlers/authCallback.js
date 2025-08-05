// src/handlers/authCallback.js

const axios = require('axios');

exports.handler = async (event) => {
  // Get the authorization code from the query parameters
  const code = event.queryStringParameters?.code;

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Authorization code not found.' }),
    };
  }

  // Retrieve environment variables
  const cognitoDomain = process.env.COGNITO_DOMAIN;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;
  const appBaseUrl = process.env.APP_BASE_URL;

  // The redirect_uri must exactly match the one used in the /login step
  const redirectUri = `${appBaseUrl}/auth/callback`;

  try {
    // Exchange the authorization code for tokens
    const response = await axios.post(
      `${cognitoDomain}/oauth2/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { id_token, access_token, refresh_token } = response.data;

    // In a real application, you would set cookies or redirect the user
    // to a protected page with the tokens.
    // For this example, we'll just return a success message.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Authentication successful!',
        id_token: id_token,
      }),
    };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};