import React, { useState, useEffect } from 'react';
import { Google, Github } from 'lucide-react';

const Login: React.FC = () => {
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
        // Redirect to dashboard (mock)
        console.log('Login successful, redirecting...');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="blob bg-pulse-primary/20 animate-blob1"></div>
        <div className="blob bg-pulse-secondary/20 animate-blob2"></div>
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
      <div className="login-card bg-white p-8 rounded-2xl shadow-lg w-full max-w-md transform opacity-0 transition-all duration-700 z-20">
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
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5BFF] font-['Open Sans'] bg-white dark:bg-[#2D3748] text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5BFF] font-['Open Sans'] bg-white dark:bg-[#2D3748] text-gray-900 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center font-['Open Sans'] text-gray-600 dark:text-gray-300">
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
              className="text-[#2E5BFF] dark:text-[#5BE7C4] font-['Open Sans'] hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="cta-button w-full py-3 bg-gradient-to-r from-[#2E5BFF] to-[#5BE7C4] text-white rounded-full font-['Inter'] font-semibold text-lg hover:shadow-lg hover:shadow-[#2E5BFF]/50 transition-all duration-300"
          >
            Sign In
          </button>
        </form>

        {/* OAuth Buttons */}
        <div className="mt-6 space-y-3">
          <button className="w-full py-3 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg font-['Open Sans'] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2D3748] transition-colors">
            <Google className="w-5 h-5 mr-2" /> Continue with Google
          </button>
          <button className="w-full py-3 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-lg font-['Open Sans'] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2D3748] transition-colors">
            <Github className="w-5 h-5 mr-2" /> Continue with GitHub
          </button>
        </div>
      </div>

      {/* Inline Styles */}
      <style>{`
        .blob {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(100px);
        }
        .animate-blob1 {
          top: -10%;
          left: -10%;
          animation: float 20s infinite ease-in-out;
        }
        .animate-blob2 {
          bottom: -10%;
          right: -10%;
          animation: float 25s infinite ease-in-out reverse;
        }
        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(100px, 100px); }
          100% { transform: translate(0, 0); }
        }
        .animate-slide-up {
          opacity: 1;
          transform: translateY(0);
        }
        .login-card {
          transform: translateY(20px);
        }
        .animate-success {
          animation: spin 0.5s ease-in-out;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;