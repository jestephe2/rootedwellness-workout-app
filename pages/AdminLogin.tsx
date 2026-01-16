import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { adminAuth } from '../services/api';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await adminAuth(password);

      if (result.status === 'ok' && result.session_token) {
        // Store session token and expiration
        localStorage.setItem('rsw_admin_session', result.session_token);
        if (result.expires_at) {
          localStorage.setItem('rsw_admin_expires', result.expires_at);
        }
        navigate('/admin');
      } else {
        setError(result.message || 'Incorrect password');
        setPassword('');
      }
    } catch (err) {
      setError('Unable to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-text max-w-md mx-auto flex items-center justify-center px-6">
      <div className="w-full space-y-8">
        {/* Logo / Brand */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-brand-text rounded-full mx-auto flex items-center justify-center">
            <Lock className="text-brand-cream" size={36} />
          </div>
          <h1 className="text-3xl font-bold text-brand-text">
            Admin Access
          </h1>
          <p className="text-brand-tan text-sm">
            Program Management System
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-4xl p-8 shadow-sm border border-brand-beige/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-3"
              >
                Admin Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-5 py-4 rounded-full bg-brand-cream text-brand-text border-2 border-transparent focus:border-brand-green focus:outline-none transition-colors"
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
              className="w-full bg-brand-text text-white py-4 px-6 rounded-full font-semibold hover:bg-brand-text/90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Access Admin</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-brand-beige">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
