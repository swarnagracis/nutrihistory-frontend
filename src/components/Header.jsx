import React from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

const Header = ({ title = 'Nutri-History' }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored user session data if needed
    localStorage.clear(); // Optional
    navigate('/');   // Redirect to login page
  };

  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
};

export default Header;
