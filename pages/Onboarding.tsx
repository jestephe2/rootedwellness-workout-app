import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight } from 'lucide-react';
import { onboardUser } from '../services/api';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    primary_goal: '',
    target_days_per_week: '',
    biggest_obstacle: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem('rsw_email');
    if (!storedEmail) {
      // If no email, redirect to home
      navigate('/');
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.first_name.trim()) {
      setError('Please enter your first name');
      return;
    }

    if (!formData.primary_goal) {
      setError('Please select your primary goal');
      return;
    }

    if (!formData.target_days_per_week) {
      setError('Please select your target days per week');
      return;
    }

    setIsLoading(true);

    try {
      // Call n8n /api/onboard endpoint
      const response = await onboardUser({
        email,
        first_name: formData.first_name.trim(),
        primary_goal: formData.primary_goal,
        target_days_per_week: formData.target_days_per_week,
        biggest_obstacle: formData.biggest_obstacle || undefined,
      });

      if (response.status === 'ok' && response.user) {
        // Store user profile
        localStorage.setItem('rsw_user', JSON.stringify(response.user));

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError(response.message || 'Unable to complete onboarding. Please try again.');
      }
    } catch (err) {
      console.error('Error during onboarding:', err);
      setError('Unable to connect. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-text max-w-md mx-auto flex items-center justify-center px-6 py-12">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-brand-green rounded-full mx-auto flex items-center justify-center">
            <UserPlus className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-brand-text">
            Welcome to Your Journey
          </h1>
          <p className="text-brand-tan text-sm">
            Tell us a bit about yourself to personalize your experience
          </p>
        </div>

        {/* Onboarding Form */}
        <div className="bg-white rounded-4xl p-8 shadow-sm border border-brand-beige/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name */}
            <div>
              <label
                htmlFor="first_name"
                className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-3"
              >
                First Name <span className="text-brand-green">*</span>
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Your first name"
                disabled={isLoading}
                className="w-full px-5 py-4 rounded-full bg-brand-cream text-brand-text border-2 border-transparent focus:border-brand-green focus:outline-none transition-colors disabled:opacity-50"
                autoFocus
              />
            </div>

            {/* Primary Goal */}
            <div>
              <label
                htmlFor="primary_goal"
                className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-3"
              >
                Primary Goal <span className="text-brand-green">*</span>
              </label>
              <select
                id="primary_goal"
                name="primary_goal"
                value={formData.primary_goal}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-5 py-4 rounded-full bg-brand-cream text-brand-text border-2 border-transparent focus:border-brand-green focus:outline-none transition-colors disabled:opacity-50 appearance-none cursor-pointer"
              >
                <option value="">Select a goal</option>
                <option value="build_strength">Build Strength</option>
                <option value="lose_fat">Lose Fat</option>
                <option value="improve_energy">Improve Energy</option>
                <option value="feel_confident">Feel More Confident</option>
                <option value="general_health">General Health</option>
              </select>
            </div>

            {/* Target Days Per Week */}
            <div>
              <label
                htmlFor="target_days_per_week"
                className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-3"
              >
                How many days per week? <span className="text-brand-green">*</span>
              </label>
              <select
                id="target_days_per_week"
                name="target_days_per_week"
                value={formData.target_days_per_week}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-5 py-4 rounded-full bg-brand-cream text-brand-text border-2 border-transparent focus:border-brand-green focus:outline-none transition-colors disabled:opacity-50 appearance-none cursor-pointer"
              >
                <option value="">Select days</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="not_sure">Not sure yet</option>
              </select>
            </div>

            {/* Biggest Obstacle (Optional) */}
            <div>
              <label
                htmlFor="biggest_obstacle"
                className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-3"
              >
                Biggest Obstacle (Optional)
              </label>
              <select
                id="biggest_obstacle"
                name="biggest_obstacle"
                value={formData.biggest_obstacle}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-5 py-4 rounded-full bg-brand-cream text-brand-text border-2 border-transparent focus:border-brand-green focus:outline-none transition-colors disabled:opacity-50 appearance-none cursor-pointer"
              >
                <option value="">Select (optional)</option>
                <option value="time">Lack of Time</option>
                <option value="motivation">Staying Motivated</option>
                <option value="knowledge">Not Sure What to Do</option>
                <option value="energy">Low Energy</option>
                <option value="consistency">Being Consistent</option>
              </select>
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
                <span>Creating your profile...</span>
              ) : (
                <>
                  <span>Start Training</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-brand-beige">
          This information helps us provide better guidance throughout your 12-week program.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
