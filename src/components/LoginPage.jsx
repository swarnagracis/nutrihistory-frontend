import React, { useState } from 'react';
import './LoginPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { validateLoginForm } from './LoginValidation';
import axios from 'axios';

const LoginPage = ({ defaultUserId = '', defaultPassword = '' }) => {
  const [formData, setFormData] = useState({
    userId: defaultUserId,
    password: defaultPassword,
  });

  const [formErrors, setFormErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoginError('');

  const { isValid, errors } = validateLoginForm(formData);
  if (!isValid) return setFormErrors(errors);

  try {
    const response = await axios.post('http://localhost:5000/api/login', formData, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    localStorage.setItem("dietitian_name", response.data.name);
    navigate('/patient-registration');
    
  } catch (error) {
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.response) {
      errorMessage = error.response.data.error || errorMessage;
    } else if (error.request) {
      errorMessage = 'Server not responding. Please check your connection.';
    }
    
    setLoginError(errorMessage);
    console.error('Login error:', error);
  }
};

  return (
    <div className="login-container">
      <div
        className="login-background"
        style={{
          backgroundImage: `url(https://dashboard.codeparrot.ai/api/image/Z9cXFCppvFKitUOU/image-1.png)`,
        }}
      >
        <h1 className="hospital-title">Nutri-History</h1>

        <div className="login-card">
          <h2 className="login-header">Login</h2>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <input
                type="text"
                name="userId"
                placeholder="User ID"
                value={formData.userId}
                onChange={handleChange}
                className="login-input"
              />
              {formErrors.userId && <p className="error-text">{formErrors.userId}</p>}
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="login-input"
              />
              {formErrors.password && <p className="error-text">{formErrors.password}</p>}
            </div>

            {loginError && <p className="error-text">{loginError}</p>}

            <button type="submit" className="login-button">
              LOGIN
            </button>

            <Link to="/Signup" className="signup-button">
              SIGN UP
            </Link>

          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
