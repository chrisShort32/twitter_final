import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ isLoggedIn, onLogout, username }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Call the logout callback
    onLogout();
    
    // Close mobile menu if open
    setIsMenuOpen(false);
    
    // Navigate to login
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Twitter DB
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          <div className={isMenuOpen ? 'hamburger open' : 'hamburger'}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          
          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <span className="username-display">Hello, {username || 'User'}</span>
              </li>
              <li className="nav-item">
                <button className="logout-button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <button className="login-button-nav" onClick={handleLogin}>
                Login
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 