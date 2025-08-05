// src/handlers/authCallback.js
const axios = require("axios");

const {
  COGNITO_DOMAIN,
  COGNITO_CLIENT_ID,
  COGNITO_CLIENT_SECRET,
  APP_BASE_URL
} = process.env;

const CALLBACK_URL = `${APP_BASE_URL}/auth/callback`;

exports.handler = async (event) => {
  // The authorization code is passed as a query string parameter
  const code = event.queryStringParameters.code;

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Authorization code not found." }),
    };
  }

  try {
    // Teaching Point: This is the secure server-to-server token exchange.
    // The client secret is used here, proving the request is from our trusted backend.
    // This is why using a 'Confidential client' is critical.
    const tokenResponse = await axios.post(
      `${COGNITO_DOMAIN}/oauth2/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: COGNITO_CLIENT_ID,
        client_secret: COGNITO_CLIENT_SECRET,
        redirect_uri: CALLBACK_URL,
        code: code,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { id_token } = tokenResponse.data;

    // Teaching Point: To create a session, we return a 'Set-Cookie' header.
    // 'httpOnly' is a crucial security flag that prevents client-side JavaScript
    // from accessing this cookie, protecting it from XSS attacks.
    // The browser will automatically include this cookie in subsequent requests
    // to our domain.
    return {
      statusCode: 302, // Redirect to the dashboard
      headers: {
        "Set-Cookie": `id_token=${id_token}; Path=/; HttpOnly; Max-Age=3600;`, // Expires in 1 hour
        Location: `${APP_BASE_URL}/dashboard`, // Your protected dashboard URL
      },
    };
  } catch (error) {
    console.error("Error exchanging code for tokens:", error.response? error.response.data : error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Authentication failed." }),
    };
  }
};