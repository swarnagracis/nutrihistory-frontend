// src/validation/LoginValidation.jsx

export const validateLoginForm = (formData) => {
    const errors = {};
  
    if (!formData.userId.trim()) {
      errors.userId = "User ID is required.";
    }
  
    if (!formData.password.trim()) {
      errors.password = "Password is required.";
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  