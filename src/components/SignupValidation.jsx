// src/validation/SignupValidation.jsx

export const validateSignupForm = (formData) => {
    const errors = {};
  
    if (!formData.name.trim()) {
      errors.name = "Name is required.";
    }
  
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email format is invalid.";
    }
  
    if (!formData.userId.trim()) {
      errors.userId = "User ID is required.";
    }
  
    if (!formData.password.trim()) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  