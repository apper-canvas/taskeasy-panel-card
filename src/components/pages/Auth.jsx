import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Sign up specific validations
    if (isSignUp) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
} else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number format';
      }

      if (!formData.company.trim()) {
        newErrors.company = 'Company name is required';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isSignUp) {
        toast.success('Account created successfully! Welcome to TaskEasy!');
      } else {
        toast.success('Welcome back! Login successful.');
      }

      // Navigate to dashboard after successful auth
      navigate('/');
    } catch (error) {
      toast.error(isSignUp ? 'Failed to create account' : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center">
              <ApperIcon name="CheckSquare" className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">TaskEasy</h1>
          </Link>
          <p className="text-secondary-600 text-sm">
            {isSignUp ? 'Create your account to get started' : 'Welcome back! Sign in to your account'}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="p-8 shadow-card-hover animate-scale-in">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-secondary-800 mb-2">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-secondary-600 text-sm">
              {isSignUp 
                ? 'Join TaskEasy and streamline your project management' 
                : 'Access your dashboard and manage your projects'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name - Sign up only */}
            {isSignUp && (
              <div>
                <Input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  icon="User"
                  className="w-full"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                icon="Mail"
                className="w-full"
              />
            </div>

            {/* Phone - Sign up only */}
            {isSignUp && (
              <div>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={errors.phone}
                  icon="Phone"
                  className="w-full"
                />
              </div>
            )}

            {/* Company - Sign up only */}
            {isSignUp && (
              <div>
                <Input
                  type="text"
                  name="company"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={handleInputChange}
                  error={errors.company}
                  icon="Building"
                  className="w-full"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                icon="Lock"
                className="w-full"
              />
            </div>

            {/* Confirm Password - Sign up only */}
            {isSignUp && (
              <div>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={errors.confirmPassword}
                  icon="Lock"
                  className="w-full"
                />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 mt-6"
              loading={loading}
              disabled={loading}
            >
              {loading 
                ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                : (isSignUp ? 'Create Account' : 'Sign In')
              }
            </Button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-secondary-600 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <Button
              variant="ghost"
              onClick={toggleMode}
              className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </Button>
          </div>

          {/* Back to Home */}
          <div className="mt-6 pt-6 border-t border-secondary-200 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-secondary-600 hover:text-secondary-800 text-sm transition-colors"
            >
              <ApperIcon name="ArrowLeft" className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-secondary-500">
          <p>© 2024 TaskEasy. Streamline your project management.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;