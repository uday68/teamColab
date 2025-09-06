import React, { useState, useEffect } from 'react';
import { Google, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Trigger slide-up and fade-in animation on mount
    const card = document.querySelector('.login-card');
    if (card) {
      card.classList.add('animate-slide-up');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    // Simulate login success animation
    const button = document.querySelector('.cta-button');
    if (button) {
      button.classList.add('animate-success');
      setTimeout(() => {
        // Redirect to dashboard
        navigate('/dashboard');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="blob bg-pulse-primary/20 animate-float-1 top-[-10%] left-[-10%]"></div>
        <div className="blob bg-pulse-secondary/20 animate-float-2 bottom-[-10%] right-[-10%]"></div>
      </div>

      {/* Header Bar */}
      <header className="absolute top-0 left-0 right-0 flex justify-between items-center p-6 z-10">
        <div className="text-2xl font-bold pulse-primary font-inter">
          PulseCollab
        </div>
        <a
          href="/register"
          className="pulse-primary hover:underline font-medium"
        >
          New here? <span className="font-bold">Create account</span>
        </a>
      </header>

      {/* Login Card */}
      <div className="login-card bg-white p-8 rounded-2xl shadow-lg w-full max-w-md opacity-0 translate-y-5 transition-all duration-700 z-20">
        <h1 className="text-3xl font-bold pulse-primary font-inter text-center">
          Welcome Back to PulseCollab
        </h1>
        <p className="text-gray-600 text-center mt-2">
          Sign in to continue your work—fast, secure, and seamless.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg font-['Open Sans'] text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-primary bg-white text-gray-900"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pulse-primary bg-white text-gray-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              Remember me
            </label>
            <a
              href="/forgot-password"
              className="pulse-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="cta-button w-full py-3 gradient-primary text-white rounded-full font-inter font-semibold text-lg hover:shadow-glow transition-all duration-300"
          >
            Sign In
          </button>
        </form>

        {/* OAuth Buttons */}
        <div className="mt-6 space-y-3">
          <button className="w-full py-3 flex items-center justify-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Google className="w-5 h-5 mr-2" /> Continue with Google
          </button>
          <button className="w-full py-3 flex items-center justify-center border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Github className="w-5 h-5 mr-2" /> Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;