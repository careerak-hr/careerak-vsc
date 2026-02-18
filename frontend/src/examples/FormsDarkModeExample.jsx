import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * FormsDarkModeExample Component
 * Demonstrates all form elements in dark mode
 * 
 * Usage: Import this component in your test page
 */
const FormsDarkModeExample = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-secondary dark:bg-dark-bg p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary dark:text-dark-text mb-4">
            Forms Dark Mode Example
          </h1>
          <button
            onClick={toggleTheme}
            className="px-6 py-3 bg-accent text-white dark:text-dark-bg rounded-lg font-bold"
          >
            Toggle Dark Mode (Current: {isDark ? 'Dark' : 'Light'})
          </button>
        </div>

        {/* Form Examples */}
        <div className="space-y-8">
          {/* Text Inputs */}
          <section className="bg-white dark:bg-dark-surface p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-dark-text mb-4">
              Text Inputs
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Text input"
                className="w-full p-4 bg-secondary dark:bg-dark-surface text-primary dark:text-dark-text 
                         placeholder-hint dark:placeholder-dark-text/40 rounded-lg
                         transition-all duration-300"
                style={{ border: '2px solid #D4816180' }}
              />
              <input
                type="email"
                placeholder="Email input"
                className="w-full p-4 bg-secondary dark:bg-dark-surface text-primary dark:text-dark-text 
                         placeholder-hint dark:placeholder-dark-text/40 rounded-lg
                         transition-all duration-300"
                style={{ border: '2px solid #D4816180' }}
              />
              <input
                type="password"
                placeholder="Password input"
                className="w-full p-4 bg-secondary dark:bg-dark-surface text-primary dark:text-dark-text 
                         placeholder-hint dark:placeholder-dark-text/40 rounded-lg
                         transition-all duration-300"
                style={{ border: '2px solid #D4816180' }}
              />
            </div>
          </section>

          {/* Select Dropdowns */}
          <section className="bg-white dark:bg-dark-surface p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-dark-text mb-4">
              Select Dropdowns
            </h2>
            <div className="space-y-4">
              <select
                className="w-full p-4 bg-secondary dark:bg-dark-surface text-primary dark:text-dark-text 
                         rounded-lg transition-all duration-300"
                style={{ border: '2px solid #D4816180' }}
              >
                <option value="">Select an option</option>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
              </select>
            </div>
          </section>

          {/* Textarea */}
          <section className="bg-white dark:bg-dark-surface p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-dark-text mb-4">
              Textarea
            </h2>
            <textarea
              placeholder="Enter your message..."
              rows="4"
              className="w-full p-4 bg-secondary dark:bg-dark-surface text-primary dark:text-dark-text 
                       placeholder-hint dark:placeholder-dark-text/40 rounded-lg
                       transition-all duration-300"
              style={{ border: '2px solid #D4816180' }}
            />
          </section>

          {/* Checkboxes */}
          <section className="bg-white dark:bg-dark-surface p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-dark-text mb-4">
              Checkboxes
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-6 h-6 rounded-lg border-4 border-primary/30 dark:border-dark-text/30 
                           bg-secondary dark:bg-dark-surface cursor-pointer transition-all"
                  aria-checked="false"
                />
                <span className="text-primary dark:text-dark-text">Checkbox option 1</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-6 h-6 rounded-lg border-4 border-primary/30 dark:border-dark-text/30 
                           bg-secondary dark:bg-dark-surface cursor-pointer transition-all"
                  aria-checked="false"
                />
                <span className="text-primary dark:text-dark-text">Checkbox option 2</span>
              </label>
            </div>
          </section>

          {/* Date Input */}
          <section className="bg-white dark:bg-dark-surface p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-dark-text mb-4">
              Date Input
            </h2>
            <input
              type="date"
              className="w-full p-4 bg-secondary dark:bg-dark-surface text-primary dark:text-dark-text 
                       rounded-lg transition-all duration-300"
              style={{ border: '2px solid #D4816180' }}
            />
          </section>

          {/* Buttons */}
          <section className="bg-white dark:bg-dark-surface p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-dark-text mb-4">
              Form Buttons
            </h2>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 py-4 bg-primary dark:bg-accent text-accent dark:text-dark-bg 
                         rounded-lg font-bold transition-all duration-300 hover:scale-105"
              >
                Submit Button
              </button>
              <button
                type="button"
                className="flex-1 py-4 bg-secondary dark:bg-dark-surface text-primary dark:text-dark-text 
                         border-2 border-accent rounded-lg font-bold transition-all duration-300 hover:scale-105"
              >
                Cancel Button
              </button>
            </div>
          </section>

          {/* Validation States */}
          <section className="bg-white dark:bg-dark-surface p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-dark-text mb-4">
              Validation States
            </h2>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Error state"
                  className="w-full p-4 bg-secondary dark:bg-dark-surface text-primary dark:text-dark-text 
                           placeholder-hint dark:placeholder-dark-text/40 rounded-lg
                           transition-all duration-300"
                  style={{ border: '2px solid #D4816180' }}
                />
                <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                  ★ This field is required
                </p>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Success state"
                  value="Valid input"
                  className="w-full p-4 bg-secondary dark:bg-dark-surface text-primary dark:text-dark-text 
                           placeholder-hint dark:placeholder-dark-text/40 rounded-lg
                           transition-all duration-300"
                  style={{ border: '2px solid #D4816180' }}
                  readOnly
                />
                <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                  ✓ Input is valid
                </p>
              </div>
            </div>
          </section>

          {/* Disabled State */}
          <section className="bg-white dark:bg-dark-surface p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-dark-text mb-4">
              Disabled State
            </h2>
            <input
              type="text"
              placeholder="Disabled input"
              disabled
              className="w-full p-4 bg-secondary/50 dark:bg-dark-surface/50 text-primary/30 dark:text-dark-text/30 
                       placeholder-hint/30 dark:placeholder-dark-text/20 rounded-lg
                       cursor-not-allowed transition-all duration-300"
              style={{ border: '2px solid #D4816180' }}
            />
          </section>

          {/* Border Color Notice */}
          <section className="bg-accent/10 dark:bg-accent/20 p-6 rounded-lg border-4 border-accent">
            <h2 className="text-2xl font-bold text-accent mb-4">
              🔒 CRITICAL RULE
            </h2>
            <p className="text-primary dark:text-dark-text text-lg">
              All input borders MUST remain <code className="bg-accent/20 px-2 py-1 rounded">#D4816180</code> in both light and dark modes.
            </p>
            <p className="text-primary dark:text-dark-text mt-2">
              محرّم تغييرها - This color NEVER changes in any state (focus, hover, active, disabled).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FormsDarkModeExample;
