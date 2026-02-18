/**
 * Dark Mode Example Component
 * 
 * This component demonstrates how to use Tailwind's dark: classes
 * with the configured dark mode strategy.
 * 
 * Usage:
 * - Add 'dark' class to <html> or <body> to enable dark mode
 * - Use dark: prefix for dark mode styles (e.g., dark:bg-gray-800)
 * - CSS variables from darkMode.css are automatically applied
 */

import React from 'react';

const DarkModeExample = () => {
  return (
    <div className="p-8 space-y-6">
      {/* Example 1: Background and Text Colors */}
      <div className="bg-secondary dark:bg-primary-dark p-6 rounded-lg">
        <h2 className="text-primary dark:text-secondary text-2xl font-bold mb-4">
          Dark Mode Example
        </h2>
        <p className="text-primary dark:text-secondary">
          This text changes color based on the theme.
        </p>
      </div>

      {/* Example 2: Buttons */}
      <div className="space-x-4">
        <button className="px-6 py-3 bg-accent hover:bg-accent-dark text-white dark:text-primary rounded-lg transition-colors">
          Primary Button
        </button>
        <button className="px-6 py-3 bg-primary dark:bg-secondary text-white dark:text-primary rounded-lg transition-colors">
          Secondary Button
        </button>
      </div>

      {/* Example 3: Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-primary-dark p-6 rounded-lg shadow-lg dark:shadow-xl">
          <h3 className="text-primary dark:text-secondary text-xl font-semibold mb-2">
            Card Title
          </h3>
          <p className="text-primary dark:text-secondary opacity-80">
            Card content that adapts to dark mode.
          </p>
        </div>
        <div className="bg-white dark:bg-primary-dark p-6 rounded-lg shadow-lg dark:shadow-xl">
          <h3 className="text-primary dark:text-secondary text-xl font-semibold mb-2">
            Another Card
          </h3>
          <p className="text-primary dark:text-secondary opacity-80">
            More content that changes with the theme.
          </p>
        </div>
      </div>

      {/* Example 4: Input Fields */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Text input"
          className="w-full px-4 py-3 rounded-lg border-2 border-accent/50 
                     bg-secondary dark:bg-primary-dark 
                     text-primary dark:text-secondary
                     focus:outline-none focus:border-accent"
        />
        <textarea
          placeholder="Textarea"
          rows="4"
          className="w-full px-4 py-3 rounded-lg border-2 border-accent/50 
                     bg-secondary dark:bg-primary-dark 
                     text-primary dark:text-secondary
                     focus:outline-none focus:border-accent"
        />
      </div>

      {/* Example 5: Borders */}
      <div className="border-2 border-primary dark:border-accent p-6 rounded-lg">
        <p className="text-primary dark:text-secondary">
          This box has a border that changes color in dark mode.
        </p>
      </div>

      {/* Example 6: Hover States */}
      <div className="space-y-2">
        <div className="p-4 bg-secondary dark:bg-primary-dark hover:bg-accent/20 dark:hover:bg-accent/30 rounded-lg cursor-pointer transition-colors">
          <p className="text-primary dark:text-secondary">
            Hover over me to see the effect
          </p>
        </div>
      </div>

      {/* Example 7: Status Colors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-success dark:bg-success-light rounded-lg text-center">
          <p className="text-white dark:text-primary font-semibold">Success</p>
        </div>
        <div className="p-4 bg-danger dark:bg-danger-light rounded-lg text-center">
          <p className="text-white dark:text-primary font-semibold">Danger</p>
        </div>
        <div className="p-4 bg-accent dark:bg-accent-light rounded-lg text-center">
          <p className="text-white dark:text-primary font-semibold">Accent</p>
        </div>
        <div className="p-4 bg-primary dark:bg-secondary rounded-lg text-center">
          <p className="text-white dark:text-primary font-semibold">Primary</p>
        </div>
      </div>
    </div>
  );
};

export default DarkModeExample;
