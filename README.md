# Google OAuth 2.0 with JWT Authentication Demo

A complete, secure implementation of Google OAuth 2.0 authentication with JWT session management using Node.js, Express, and vanilla JavaScript.

## 🚀 Features

- **Complete OAuth 2.0 Flow**: Standard authorization code flow with Google
- **JWT Session Management**: Secure token-based sessions with 5-minute expiry
- **HttpOnly Cookies**: XSS-resistant cookie storage
- **Server-Side Verification**: All tokens validated on the backend
- **Protected API Routes**: Middleware-protected endpoints
- **Modern UI**: Clean, responsive interface
- **Security Best Practices**: CSRF protection, secure cookies, proper error handling

## 📋 Prerequisites

- Node.js (v14+ recommended)
- Google Cloud Console account
- Basic understanding of OAuth 2.0 flow

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone or download this project
cd google-oauth-app

# Install dependencies
npm install
```

### 2. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client IDs**
5. Configure the OAuth consent screen if prompted
6. Set up the OAuth 2.0 Client ID:
   - **Application type**: Web application
   - **Name**: Your app name (e.g., "OAuth Demo App")
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/auth/google/callback` (for development)
     - Add production URLs as needed

### 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your credentials:
   ```env
   # From Google Cloud Console
   GOOGLE_CLIENT_ID=your_actual_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_actual_client_secret
   
   # Generate a secure JWT secret (64+ characters recommended)
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random
   
   # Cookie settings
   COOKIE_KEY=oauth_session
   SERVER_URL=http://localhost:3000
   ```

3. **Generate a secure JWT secret**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### 4. Run the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## 🔐 Authentication Flow

### Step-by-Step Process

1. **User Clicks Login**: User visits `/` and clicks "Login with Google"
2. **Redirect to Google**: Server redirects to Google OAuth consent screen
3. **User Grants Permission**: User authorizes the application
4. **Google Callback**: Google redirects back with authorization code
5. **Token Exchange**: Server exchanges code for access_token and id_token
6. **Token Verification**: Server verifies the Google id_token
7. **JWT Creation**: Server creates custom JWT with user data
8. **Secure Cookie**: JWT stored in HttpOnly, Secure cookie (5-min expiry)
9. **Dashboard Redirect**: User redirected to dashboard page
10. **Protected API Access**: Dashboard can fetch user profile via protected endpoint

## 📁 Project Structure

```
google-oauth-app/
├── server.js              # Express server with OAuth routes
├── package.json            # Dependencies and scripts
├── .env.example           # Environment variables template
├── .env                   # Your actual environment variables (git-ignored)
├── public/
│   ├── index.html         # Login page with Google OAuth button
│   └── dashboard.html     # Protected dashboard with profile fetching
└── README.md              # This file
```

## 🛡️ Security Features

### JWT Implementation
- **Short-lived tokens**: 5-minute expiration for testing
- **Secure storage**: HttpOnly cookies prevent XSS access
- **Server-side verification**: All tokens validated on backend

### Cookie Security
- **HttpOnly**: Prevents JavaScript access to cookies
- **Secure**: Only sent over HTTPS in production
- **SameSite**: CSRF protection
- **Expiration**: Matches JWT expiration time

### OAuth Best Practices
- **Authorization Code Flow**: Most secure OAuth flow
- **Server-side token exchange**: Client never sees tokens
- **State parameter**: CSRF protection (can be added)
- **Scope limitation**: Only requests necessary permissions

## 🔗 API Endpoints

### Authentication Routes
- `GET /` - Serve login page
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Handle Google callback
- `GET /dashboard.html` - Serve dashboard page

### Protected API Routes
- `GET /api/profile` - Get user profile (JWT required)
- `POST /api/logout` - Clear authentication cookie

### Utility Routes
- `GET /health` - Health check endpoint

## 🧪 Testing the Flow

1. **Start the server**: `npm run dev`
2. **Visit login page**: Go to `http://localhost:3000`
3. **Login with Google**: Click the login button
4. **Authorize permissions**: Grant access to your Google account
5. **View dashboard**: Should redirect to dashboard automatically
6. **Test protected API**: Click "Fetch Profile" to test JWT authentication
7. **Test expiration**: Wait 5 minutes and try fetching profile again
8. **Test logout**: Click logout to clear session

## 🚨 Common Issues and Solutions

### "Redirect URI mismatch" Error
- Ensure the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/auth/google/callback`
- Check for trailing slashes, http vs https, port numbers

### "Invalid JWT Secret" Error
- Ensure JWT_SECRET is set in .env file
- Use a strong, long secret (64+ characters recommended)

### "Cookie not set" Issues
- Check that COOKIE_KEY is set in environment variables
- Ensure cookies are enabled in your browser
- For production, ensure HTTPS is configured properly

### "Token exchange failed" Error
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Check that the OAuth consent screen is configured
- Ensure the Google APIs are enabled in Cloud Console

## 📚 Dependencies

- **express**: Web framework
- **cookie-parser**: Parse cookies
- **jsonwebtoken**: JWT creation and verification
- **axios**: HTTP client for Google API calls
- **dotenv**: Environment variable management

## 🔄 Production Deployment

1. **Environment Variables**: Set all required environment variables
2. **HTTPS**: Use HTTPS in production (required for secure cookies)
3. **JWT Secret**: Use a cryptographically strong secret
4. **Cookie Settings**: Update security settings for production
5. **Google Console**: Add production redirect URIs
6. **Error Handling**: Implement comprehensive error logging

## 📖 Educational Value

This implementation demonstrates:
- OAuth 2.0 Authorization Code Flow
- JWT token creation and verification
- Secure cookie handling
- Protected API routes with middleware
- Client-side API consumption
- Security best practices
- Error handling and user experience

Perfect for learning modern web authentication patterns and security practices.

## 🤝 Contributing

Feel free to submit issues, feature requests, or improvements. This is an educational project designed to demonstrate secure OAuth implementation patterns.

## 📄 License

MIT License - Feel free to use this code for learning and development purposes.