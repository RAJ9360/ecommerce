/**
 * Validation utilities for the FullStack Intern Coding Challenge
 */

// Email regex check
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Special character regex (at least one)
const specialCharRegex = /[\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\.\>\/\?\\\|]/;

// Uppercase letter regex (at least one)
const uppercaseRegex = /[A-Z]/;

function validateName(name) {
  if (!name || typeof name !== 'string') {
    return 'Name must be a string.';
  }
  const len = name.trim().length;
  if (len < 20 || len > 60) {
    return 'Name must be between 20 and 60 characters.';
  }
  return null;
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email must be a string.';
  }
  if (!emailRegex.test(email.trim())) {
    return 'Email format is invalid.';
  }
  return null;
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password must be a string.';
  }
  const len = password.length;
  if (len < 8 || len > 16) {
    return 'Password must be between 8 and 16 characters.';
  }
  if (!uppercaseRegex.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!specialCharRegex.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
}

function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    return 'Address must be a string.';
  }
  const len = address.trim().length;
  if (len === 0) {
    return 'Address is required.';
  }
  if (len > 400) {
    return 'Address cannot exceed 400 characters.';
  }
  return null;
}

function validateUser({ name, email, password, address, skipPassword = false }) {
  const errors = {};
  
  const nameError = validateName(name);
  if (nameError) errors.name = nameError;
  
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  
  if (!skipPassword) {
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;
  }
  
  const addressError = validateAddress(address);
  if (addressError) errors.address = addressError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateUser
};
