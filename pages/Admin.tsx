import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Download, Eye, Plus, Upload, Save, RotateCcw } from 'lucide-react';
import { ProgramVariation, ProgramWeek, ProgramLibrary } from '../types';
import WeekBuilder from '../components/admin/WeekBuilder';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [activeVariation, setActiveVariation] = useState<0 | 1>(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importJSON, setImportJSON] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Check admin session and expiration
  useEffect(() => {
    const sessionToken = localStorage.getItem('rsw_admin_session');
    const expiresAt = localStorage.getItem('rsw_admin_expires');

    if (!sessionToken) {
      navigate('/admin/login');
      return;
    }

    // Check if session has expired
    if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      const now = new Date();

      if (now >= expirationDate) {
        // Session expired, clear and redirect
        localStorage.removeItem('rsw_admin_session');
        localStorage.removeItem('rsw_admin_expires');
        navigate('/admin/login');
      }
    }
  }, [navigate]);

  // Initialize with 2 program variations
  const [variations, setVariations] = useState<ProgramVariation[]>([
    {
      id: 'variation_1',
      name: 'Program Variation 1',
      description: 'Description for variation 1',
      program: {
        weeks: Array.from({ length: 6 }, (_, i) => ({
          week: i + 1,
          days: [
            {
              day: 1,
              title: '',
              exercises: [{ name: '', sets: 3, reps: 10, equipment: '' }],
            },
          ],
        })),
      },
    },
    {
      id: 'variation_2',
      name: 'Program Variation 2',
      description: 'Description for variation 2',
      program: {
        weeks: Array.from({ length: 6 }, (_, i) => ({
          week: i + 1,
          days: [
            {
              day: 1,
              title: '',
              exercises: [{ name: '', sets: 3, reps: 10, equipment: '' }],
            },
          ],
        })),
      },
    },
  ]);

  const currentVariation = variations[activeVariation];

  const handleLogout = () => {
    localStorage.removeItem('rsw_admin_session');
    localStorage.removeItem('rsw_admin_expires');
    navigate('/admin/login');
  };

  const handleVariationChange = (field: 'name' | 'description', value: string) => {
    const newVariations = [...variations];
    newVariations[activeVariation] = {
      ...newVariations[activeVariation],
      [field]: value,
    };
    setVariations(newVariations);
  };

  const handleUpdateWeek = (weekIndex: number, week: ProgramWeek) => {
    const newVariations = [...variations];
    newVariations[activeVariation].program.weeks[weekIndex] = week;
    setVariations(newVariations);
  };

  const handleExport = () => {
    const programLibrary = {
      variations: variations,
    };

    const fileContent = `// Auto-generated Program Data
// Generated on: ${new Date().toISOString()}

import { ProgramLibrary } from '../types';

export const PROGRAM_LIBRARY: ProgramLibrary = ${JSON.stringify(programLibrary, null, 2)};

// Helper function to get a specific variation
export function getVariation(id: string) {
  return PROGRAM_LIBRARY.variations.find(v => v.id === id);
}

// Helper function to get a specific week from a variation
export function getWeekData(variationId: string, weekNumber: number) {
  const variation = getVariation(variationId);
  return variation?.program.weeks.find(w => w.week === weekNumber);
}

// Helper function to get a specific day from a variation
export function getDayData(variationId: string, weekNumber: number, dayNumber: number) {
  const week = getWeekData(variationId, weekNumber);
  return week?.days.find(d => d.day === dayNumber);
}

// Helper function to get all days for a week
export function getDaysForWeek(variationId: string, weekNumber: number) {
  const week = getWeekData(variationId, weekNumber);
  return week?.days || [];
}
`;

    // Create download
    const blob = new Blob([fileContent], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'program.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = () => {
    const programLibrary = {
      variations: variations,
    };
    navigator.clipboard.writeText(JSON.stringify(programLibrary, null, 2));
    alert('JSON copied to clipboard!');
  };

  const handleImportJSON = () => {
    setImportError(null);

    try {
      const parsed = JSON.parse(importJSON);

      // Validate structure
      if (!parsed.variations || !Array.isArray(parsed.variations)) {
        throw new Error('Invalid format: must have "variations" array');
      }

      if (parsed.variations.length !== 2) {
        throw new Error('Must have exactly 2 program variations');
      }

      // Validate each variation
      parsed.variations.forEach((v: any, idx: number) => {
        if (!v.id || !v.name || !v.program || !v.program.weeks) {
          throw new Error(`Variation ${idx + 1} missing required fields`);
        }
        if (!Array.isArray(v.program.weeks) || v.program.weeks.length !== 6) {
          throw new Error(`Variation ${idx + 1} must have exactly 6 weeks`);
        }
      });

      // Import successful
      setVariations(parsed.variations);
      setImportJSON('');
      setShowImport(false);
      alert('Program imported successfully!');
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Invalid JSON format');
    }
  };

  const handlePublish = () => {
    const programLibrary: ProgramLibrary = {
      variations: variations,
    };

    // Save to localStorage for instant updates
    localStorage.setItem('rsw_program_library', JSON.stringify(programLibrary));
    localStorage.setItem('rsw_program_published_at', new Date().toISOString());

    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 3000);
  };

  const handleRevert = () => {
    if (confirm('Are you sure you want to revert to the default program? All published changes will be lost.')) {
      localStorage.removeItem('rsw_program_library');
      localStorage.removeItem('rsw_program_published_at');
      alert('Reverted to default program. Users will need to refresh their page.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-text pb-12">
      {/* Header */}
      <header className="bg-brand-text text-white px-6 py-6 shadow-lg sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Program Builder</h1>
            <p className="text-brand-cream/70 text-sm mt-1">
              Admin Management System
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImport(!showImport)}
              className="px-3 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              <Upload size={16} />
              <span>Import JSON</span>
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-2 bg-brand-green text-white rounded-full text-sm font-semibold hover:bg-brand-green/90 transition-all flex items-center gap-2"
            >
              <Eye size={16} />
              <span>{showPreview ? 'Hide' : 'Show'}</span>
            </button>
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <Save size={16} />
              <span>Save & Publish</span>
            </button>
            <button
              onClick={handleRevert}
              className="px-3 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition-all flex items-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Revert</span>
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-white text-brand-text rounded-full text-sm font-semibold hover:bg-brand-cream transition-all flex items-center gap-2"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-500 text-white rounded-full text-sm font-semibold hover:bg-red-600 transition-all flex items-center gap-2"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Publish Success Message */}
        {publishSuccess && (
          <div className="bg-green-50 border-2 border-green-500 text-green-800 px-6 py-4 rounded-3xl text-center font-semibold shadow-lg">
            ✓ Program published successfully! Changes are now live for all users.
          </div>
        )}

        {/* JSON Import */}
        {showImport && (
          <div className="bg-white rounded-4xl p-6 shadow-sm border border-brand-beige/20">
            <h3 className="text-lg font-bold mb-4">Import Program from JSON</h3>
            <p className="text-sm text-brand-tan mb-4">
              Paste your complete program JSON below. Must include 2 variations with 6 weeks each.
            </p>
            <textarea
              value={importJSON}
              onChange={(e) => setImportJSON(e.target.value)}
              placeholder='{"variations": [...]}'
              className="w-full h-64 px-4 py-3 rounded-2xl bg-brand-cream text-brand-text border-2 border-brand-beige/20 focus:border-brand-green focus:outline-none font-mono text-xs resize-none"
            />
            {importError && (
              <div className="mt-3 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                {importError}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleImportJSON}
                disabled={!importJSON.trim()}
                className="flex-1 bg-brand-green text-white py-3 px-6 rounded-full font-semibold hover:bg-brand-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import & Apply
              </button>
              <button
                onClick={() => {
                  setShowImport(false);
                  setImportJSON('');
                  setImportError(null);
                }}
                className="px-6 py-3 bg-brand-cream text-brand-text rounded-full font-semibold hover:bg-brand-beige/30 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* JSON Preview */}
        {showPreview && (
          <div className="bg-white rounded-4xl p-6 shadow-sm border border-brand-beige/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">JSON Preview</h3>
              <button
                onClick={handleCopyJSON}
                className="px-4 py-2 bg-brand-green text-white rounded-full text-sm font-semibold hover:bg-brand-green/90 transition-all"
              >
                Copy JSON
              </button>
            </div>
            <pre className="bg-brand-cream p-4 rounded-2xl overflow-auto max-h-96 text-xs">
              {JSON.stringify({ variations }, null, 2)}
            </pre>
          </div>
        )}

        {/* Variation Tabs */}
        <div className="bg-white rounded-4xl p-6 shadow-sm border border-brand-beige/20">
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setActiveVariation(0)}
              className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all ${
                activeVariation === 0
                  ? 'bg-brand-green text-white shadow-md'
                  : 'bg-brand-cream text-brand-text hover:bg-brand-beige/30'
              }`}
            >
              Variation 1
            </button>
            <button
              onClick={() => setActiveVariation(1)}
              className={`flex-1 py-3 px-6 rounded-2xl font-semibold transition-all ${
                activeVariation === 1
                  ? 'bg-brand-green text-white shadow-md'
                  : 'bg-brand-cream text-brand-text hover:bg-brand-beige/30'
              }`}
            >
              Variation 2
            </button>
          </div>

          {/* Variation Metadata */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-2">
                Program Name
              </label>
              <input
                type="text"
                value={currentVariation.name}
                onChange={(e) => handleVariationChange('name', e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-brand-cream text-brand-text border-2 border-transparent focus:border-brand-green focus:outline-none"
                placeholder="e.g., 3-Day Split"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-brand-beige mb-2">
                Description
              </label>
              <textarea
                value={currentVariation.description}
                onChange={(e) => handleVariationChange('description', e.target.value)}
                className="w-full px-5 py-3 rounded-3xl bg-brand-cream text-brand-text border-2 border-transparent focus:border-brand-green focus:outline-none resize-none"
                rows={2}
                placeholder="Brief description of this program variation"
              />
            </div>
          </div>
        </div>

        {/* Week Builders */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold px-2">
            6-Week Program Structure
          </h2>
          {currentVariation.program.weeks.map((week, idx) => (
            <WeekBuilder
              key={idx}
              week={week}
              weekIndex={idx}
              onUpdate={handleUpdateWeek}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Admin;
