const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Environment variables
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET,
  COOKIE_KEY,
  SERVER_URL = `http://localhost:${PORT}`
} = process.env;

// Validate required environment variables
const requiredEnvVars = {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET,
  COOKIE_KEY
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// Google OAuth URLs
const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// JWT middleware to verify tokens
const authenticateToken = (req, res, next) => {
  const token = req.cookies[COOKIE_KEY];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token is missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the dashboard page
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Initiate Google OAuth flow
app.get('/auth/google', (req, res) => {
  const redirectUri = `${SERVER_URL}/auth/google/callback`;
  const scope = 'openid email profile';
  const responseType = 'code';
  const accessType = 'offline';
  
  const authUrl = `${GOOGLE_OAUTH_URL}?` + 
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=${responseType}&` +
    `access_type=${accessType}`;
  
  console.log('Redirecting to Google OAuth:', authUrl);
  res.redirect(authUrl);
});

// Handle Google OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    console.error('OAuth error:', error);
    return res.status(400).json({ error: 'Authentication failed', details: error });
  }
  
  if (!code) {
    console.error('No authorization code received');
    return res.status(400).json({ error: 'No authorization code received' });
  }

  try {
    // Exchange authorization code for tokens
    const redirectUri = `${SERVER_URL}/auth/google/callback`;
    const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, id_token } = tokenResponse.data;
    
    if (!access_token || !id_token) {
      throw new Error('Failed to retrieve tokens from Google');
    }

    // Verify and decode the ID token
    const idTokenPayload = jwt.decode(id_token);
    console.log('ID Token payload:', idTokenPayload);

    // Get additional user info using access token
    const userInfoResponse = await axios.get(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const userInfo = userInfoResponse.data;
    console.log('User info from Google:', userInfo);

    // Create our own JWT with user information
    const jwtPayload = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      verified_email: userInfo.verified_email
    };

    // Sign JWT with 5-minute expiration
    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '5m' });

    // Set secure HTTP-only cookie
    res.cookie(COOKIE_KEY, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000 // 5 minutes in milliseconds
    });

    console.log('Authentication successful, redirecting to dashboard');
    res.redirect('/dashboard.html');

  } catch (error) {
    console.error('Error during token exchange:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Authentication failed', 
      details: error.response?.data || error.message 
    });
  }
});

// Protected API endpoint - get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  console.log('Profile request from user:', req.user.email);
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    picture: req.user.picture,
    verified_email: req.user.verified_email
  });
});

// Logout endpoint - clear the cookie
app.post('/api/logout', (req, res) => {
  res.clearCookie(COOKIE_KEY);
  res.json({ message: 'Logged out successfully' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on ${SERVER_URL}`);
  console.log(`Navigate to ${SERVER_URL} to start the OAuth flow`);
});