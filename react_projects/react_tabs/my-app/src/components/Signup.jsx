import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css'; // Reusing the login styles
import googleLogo from '../assets/google-logo.png';

const Signup = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (formData.password1 !== formData.password2) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Call the registration API
      const response = await fetch('http://54.147.244.63:8000/api/auth/registration/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password1: formData.password1,
          password2: formData.password2,
          first_name: formData.first_name,
          last_name: formData.last_name
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Format validation errors
        if (data.username) {
          throw new Error(`Username: ${data.username.join(' ')}`);
        } else if (data.email) {
          throw new Error(`Email: ${data.email.join(' ')}`);
        } else if (data.password1) {
          throw new Error(`Password: ${data.password1.join(' ')}`);
        } else if (data.non_field_errors) {
          throw new Error(data.non_field_errors.join(' '));
        } else {
          throw new Error('Registration failed. Please try again.');
        }
      }

      // If registration successful, automatically log in
      const loginResponse = await fetch('http://54.147.244.63:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password1
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error('Registration successful, but automatic login failed. Please log in manually.');
      }

      // Store tokens in localStorage
      localStorage.setItem('access_token', loginData.access);
      localStorage.setItem('refresh_token', loginData.refresh);
      
      // Trigger the onLogin callback
      onLogin(loginData.access);

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

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="login-container">
      <div className="login-card signup-card">
        <h2>Create an Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password1">Password</label>
            <input
              type="password"
              id="password1"
              name="password1"
              value={formData.password1}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
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
          Sign up with Google
        </button>
        
        <div className="signup-link">
          Already have an account? <button onClick={handleLogin}>Log in</button>
        </div>
      </div>
    </div>
  );
};

export default Signup; 