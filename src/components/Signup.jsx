import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateSignupForm } from './SignupValidation';
import './Signup.css';
import axios from 'axios';
import BASE_URL from '../config';

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userId: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateSignupForm(formData);

    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    try {
      const { data } = await axios.post(`${BASE_URL}/api/signup`, formData);
      alert(data.message);            // use data.message
      setFormErrors({});
      setFormData({ name: '', email: '', userId: '', password: '' });
      navigate('/');                  // redirect to login
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed.';
      alert(msg);
    }
  };

  return (
    <div className="Signup-container">
      <div
        className="Signup-background"
        style={{
          backgroundImage: `url(https://dashboard.codeparrot.ai/api/image/Z9cXFCppvFKitUOU/image-1.png)`,
        }}
      >
        <h1 className="hospital-title">Kasturba Hospital - Manipal</h1>
        <div className="Signup-card">
          <h2 className="Signup-header">Sign Up</h2>
          <form onSubmit={handleSubmit} className="Signup-form">
            {[
              { name: 'name',     type: 'text',     placeholder: 'Name' },
              { name: 'email',    type: 'email',    placeholder: 'Email ID' },
              { name: 'userId',   type: 'text',     placeholder: 'User ID' },
              { name: 'password', type: 'password', placeholder: 'Password' },
            ].map((field) => (
              <div className="input-group" key={field.name}>
                <input
                  {...field}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="Signup-input"
                />
                {formErrors[field.name] && (
                  <p className="error-text">{formErrors[field.name]}</p>
                )}
              </div>
            ))}
            <button type="submit" className="signup-button">
              SIGN UP
            </button>
            <Link to="/" className="login-button">
              LOGIN
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
