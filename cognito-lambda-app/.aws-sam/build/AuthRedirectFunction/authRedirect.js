// src/handlers/authRedirect.js

exports.handler = async (event) => {
  // Retrieve environment variables defined in template.yaml
  const cognitoDomain = process.env.COGNITO_DOMAIN;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const appBaseUrl = process.env.APP_BASE_URL;

  // This is the URL of our own callback function
  const redirectUri = `${appBaseUrl}/auth/callback`;

  // Construct the query parameters for the Cognito /oauth2/authorize endpoint
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid profile email phone', // The scopes you want to request
  });

  // The final URL to redirect the user to the Cognito Hosted UI
  const authorizationUrl = `${cognitoDomain}/oauth2/authorize?${params.toString()}`;

  console.log(`Redirecting user to: ${authorizationUrl}`);

  // Return a 302 redirect response
  return {
    statusCode: 302,
    headers: {
      Location: authorizationUrl,
    },
  };
};