import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { initUser } from '../services/api';

const EmailEntry: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Call n8n /api/init endpoint
      const response = await initUser(email.toLowerCase().trim());

      // Store email in localStorage
      localStorage.setItem('rsw_email', email.toLowerCase().trim());

      // Route based on response
      if (response.status === 'existing_user') {
        // Store user profile and recent logs
        if (response.user) {
          localStorage.setItem('rsw_user', JSON.stringify(response.user));
        }
        if (response.recent_logs) {
          localStorage.setItem('rsw_logs', JSON.stringify(response.recent_logs));
        }
        navigate('/dashboard');
      } else {
        // New user - go to onboarding
        navigate('/onboarding');
      }
    } catch (err) {
      console.error('Error during init:', err);
      setError('Unable to connect. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-text max-w-md mx-auto flex items-center justify-center px-6">
      <div className="w-full space-y-8">
        {/* Logo / Brand */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-brand-green rounded-full mx-auto flex items-center justify-center">
            <Mail className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-bold text-brand-text">
            Rachel Stephens<br />Wellness
          </h1>
          <p className="text-brand-tan text-sm">
            Your 6-Week Strength Journey
          </p>
        </div>

        {/* Email Entry Form */}
        <div className="bg-white rounded-4xl p-8 shadow-sm border border-brand-beige/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-3"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={isLoading}
                className="w-full px-5 py-4 rounded-full bg-brand-cream text-brand-text border-2 border-transparent focus:border-brand-green focus:outline-none transition-colors disabled:opacity-50"
                autoComplete="email"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-3xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-green text-white py-4 px-6 rounded-full font-semibold hover:bg-brand-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-brand-beige">
          By continuing, you agree to receive workout guidance and progress tracking.
        </p>
      </div>
    </div>
  );
};

export default EmailEntry;
