import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import googleLogo from '../assets/google-logo.png';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the traditional login API
      const response = await fetch('http://54.147.244.63:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed. Please check your credentials.');
      }

      // Store tokens in localStorage
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Trigger the onLogin callback
      onLogin(data.access);

      // Redirect to home
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = 'http://54.147.244.63:8000/api/auth/google/login/';
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login to Your Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button 
          type="button" 
          className="google-login-button"
          onClick={handleGoogleLogin}
        >
          <img src={googleLogo} alt="Google logo" className="google-logo" />
          Sign in with Google
        </button>
        
        <div className="signup-link">
          Don't have an account? <button onClick={handleSignup}>Sign up</button>
        </div>
      </div>
    </div>
  );
};

export default Login; 