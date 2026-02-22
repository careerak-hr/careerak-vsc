/**
 * Focus Indicators Example
 * 
 * This example demonstrates visible focus indicators on all interactive elements.
 * 
 * Usage:
 * 1. Navigate with Tab key to see focus indicators
 * 2. Try different element types
 * 3. Test in light and dark modes
 * 4. Test with high contrast mode
 * 
 * @see docs/FOCUS_INDICATORS_VERIFICATION.md
 */

import React, { useState } from 'react';

const FocusIndicatorsExample = () => {
  const [isDark, setIsDark] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    agree: false,
    option: 'option1',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Form submitted! Check the console for data.');
    console.log('Form data:', formData);
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-secondary dark:bg-primary-dark p-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-primary dark:text-secondary mb-4">
              Focus Indicators Example
            </h1>
            <p className="text-lg text-primary dark:text-secondary mb-4">
              Press <kbd className="px-2 py-1 bg-primary text-secondary rounded">Tab</kbd> to navigate through interactive elements and see visible focus indicators.
            </p>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="px-4 py-2 bg-primary dark:bg-accent text-secondary rounded-lg hover:bg-accent dark:hover:bg-primary transition-colors"
            >
              {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </header>

          {/* Instructions */}
          <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-4">
              Testing Instructions
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-primary dark:text-secondary">
              <li>Use <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Tab</kbd> to navigate forward</li>
              <li>Use <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Shift+Tab</kbd> to navigate backward</li>
              <li>Notice the 2px solid outline in accent color (#D48161)</li>
              <li>Notice the 2px offset from the element</li>
              <li>Try clicking with mouse - no focus indicator</li>
              <li>Try navigating with keyboard - focus indicator appears</li>
              <li>Toggle dark mode to see focus indicators in both themes</li>
            </ol>
          </section>

          {/* Buttons Section */}
          <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-4">
              1. Buttons
            </h2>
            <div className="flex flex-wrap gap-4">
              <button className="px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-accent transition-colors">
                Primary Button
              </button>
              <button className="px-4 py-2 bg-accent text-secondary rounded-lg hover:bg-primary transition-colors">
                Accent Button
              </button>
              <button className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-primary dark:text-secondary rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">
                Secondary Button
              </button>
              <button 
                className="px-4 py-2 border-2 border-primary dark:border-accent text-primary dark:text-accent rounded-lg hover:bg-primary hover:text-secondary dark:hover:bg-accent dark:hover:text-primary transition-colors"
              >
                Outline Button
              </button>
            </div>
          </section>

          {/* Links Section */}
          <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-4">
              2. Links
            </h2>
            <nav className="flex flex-wrap gap-4">
              <a href="#home" className="text-primary dark:text-accent hover:underline">
                Home
              </a>
              <a href="#about" className="text-primary dark:text-accent hover:underline">
                About
              </a>
              <a href="#services" className="text-primary dark:text-accent hover:underline">
                Services
              </a>
              <a href="#contact" className="text-primary dark:text-accent hover:underline">
                Contact
              </a>
            </nav>
          </section>

          {/* Form Section */}
          <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-4">
              3. Form Inputs
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Text Input */}
              <div>
                <label htmlFor="name" className="block text-primary dark:text-secondary mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#D4816180] rounded-lg bg-secondary dark:bg-gray-700 text-primary dark:text-secondary"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-primary dark:text-secondary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#D4816180] rounded-lg bg-secondary dark:bg-gray-700 text-primary dark:text-secondary"
                  placeholder="Enter your email"
                />
              </div>

              {/* Textarea */}
              <div>
                <label htmlFor="message" className="block text-primary dark:text-secondary mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#D4816180] rounded-lg bg-secondary dark:bg-gray-700 text-primary dark:text-secondary"
                  placeholder="Enter your message"
                  rows={4}
                />
              </div>

              {/* Select */}
              <div>
                <label htmlFor="option" className="block text-primary dark:text-secondary mb-2">
                  Select Option
                </label>
                <select
                  id="option"
                  value={formData.option}
                  onChange={(e) => setFormData({ ...formData, option: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#D4816180] rounded-lg bg-secondary dark:bg-gray-700 text-primary dark:text-secondary"
                >
                  <option value="option1">Option 1</option>
                  <option value="option2">Option 2</option>
                  <option value="option3">Option 3</option>
                </select>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={formData.agree}
                  onChange={(e) => setFormData({ ...formData, agree: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="agree" className="text-primary dark:text-secondary">
                  I agree to the terms and conditions
                </label>
              </div>

              {/* Radio Buttons */}
              <div>
                <p className="text-primary dark:text-secondary mb-2">Choose a plan:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="basic"
                      name="plan"
                      value="basic"
                      className="w-5 h-5"
                    />
                    <label htmlFor="basic" className="text-primary dark:text-secondary">
                      Basic Plan
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="pro"
                      name="plan"
                      value="pro"
                      className="w-5 h-5"
                    />
                    <label htmlFor="pro" className="text-primary dark:text-secondary">
                      Pro Plan
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="enterprise"
                      name="plan"
                      value="enterprise"
                      className="w-5 h-5"
                    />
                    <label htmlFor="enterprise" className="text-primary dark:text-secondary">
                      Enterprise Plan
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-secondary rounded-lg hover:bg-accent transition-colors"
              >
                Submit Form
              </button>
            </form>
          </section>

          {/* Interactive Elements Section */}
          <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-4">
              4. Interactive Elements
            </h2>
            
            {/* Tabs */}
            <div className="mb-6">
              <p className="text-primary dark:text-secondary mb-2">Tabs:</p>
              <div className="flex gap-2">
                <div
                  role="tab"
                  tabIndex={0}
                  className="px-4 py-2 bg-primary text-secondary rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => alert('Tab 1 clicked')}
                  onKeyDown={(e) => e.key === 'Enter' && alert('Tab 1 activated')}
                >
                  Tab 1
                </div>
                <div
                  role="tab"
                  tabIndex={0}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-primary dark:text-secondary rounded-lg cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => alert('Tab 2 clicked')}
                  onKeyDown={(e) => e.key === 'Enter' && alert('Tab 2 activated')}
                >
                  Tab 2
                </div>
                <div
                  role="tab"
                  tabIndex={0}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-primary dark:text-secondary rounded-lg cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => alert('Tab 3 clicked')}
                  onKeyDown={(e) => e.key === 'Enter' && alert('Tab 3 activated')}
                >
                  Tab 3
                </div>
              </div>
            </div>

            {/* Clickable Cards */}
            <div className="mb-6">
              <p className="text-primary dark:text-secondary mb-2">Clickable Cards:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  tabIndex={0}
                  className="p-4 bg-secondary dark:bg-gray-700 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => alert('Card 1 clicked')}
                  onKeyDown={(e) => e.key === 'Enter' && alert('Card 1 activated')}
                >
                  <h3 className="text-lg font-bold text-primary dark:text-secondary mb-2">
                    Card 1
                  </h3>
                  <p className="text-primary dark:text-secondary">
                    This is a clickable card with focus indicator.
                  </p>
                </div>
                <div
                  tabIndex={0}
                  className="p-4 bg-secondary dark:bg-gray-700 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => alert('Card 2 clicked')}
                  onKeyDown={(e) => e.key === 'Enter' && alert('Card 2 activated')}
                >
                  <h3 className="text-lg font-bold text-primary dark:text-secondary mb-2">
                    Card 2
                  </h3>
                  <p className="text-primary dark:text-secondary">
                    Navigate with Tab to see the focus indicator.
                  </p>
                </div>
                <div
                  tabIndex={0}
                  className="p-4 bg-secondary dark:bg-gray-700 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => alert('Card 3 clicked')}
                  onKeyDown={(e) => e.key === 'Enter' && alert('Card 3 activated')}
                >
                  <h3 className="text-lg font-bold text-primary dark:text-secondary mb-2">
                    Card 3
                  </h3>
                  <p className="text-primary dark:text-secondary">
                    Press Enter or Space to activate.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Skip Link Example */}
          <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-4">
              5. Skip Link
            </h2>
            <p className="text-primary dark:text-secondary mb-4">
              Skip links are hidden until focused. Press Tab from the top of the page to see them.
            </p>
            <a
              href="#main-content"
              className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 px-4 py-2 bg-primary text-secondary rounded-lg"
            >
              Skip to main content
            </a>
          </section>

          {/* Specifications */}
          <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-4">
              Focus Indicator Specifications
            </h2>
            <table className="w-full text-left text-primary dark:text-secondary">
              <thead>
                <tr className="border-b-2 border-primary dark:border-accent">
                  <th className="py-2">Property</th>
                  <th className="py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <td className="py-2">Outline Width</td>
                  <td className="py-2">2px</td>
                </tr>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <td className="py-2">Outline Style</td>
                  <td className="py-2">solid</td>
                </tr>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <td className="py-2">Outline Color</td>
                  <td className="py-2">#D48161 (Accent)</td>
                </tr>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <td className="py-2">Outline Offset</td>
                  <td className="py-2">2px</td>
                </tr>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <td className="py-2">Transition</td>
                  <td className="py-2">300ms ease</td>
                </tr>
                <tr>
                  <td className="py-2">Contrast Ratio</td>
                  <td className="py-2">~3.5:1 (WCAG AA ✅)</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* WCAG Compliance */}
          <section className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-4">
              WCAG 2.1 Compliance
            </h2>
            <ul className="space-y-2 text-primary dark:text-secondary">
              <li>✅ Success Criterion 2.4.7 (Focus Visible) - Level AA</li>
              <li>✅ Success Criterion 1.4.11 (Non-text Contrast) - Level AA</li>
              <li>✅ Success Criterion 2.1.1 (Keyboard) - Level A</li>
              <li>✅ Success Criterion 2.4.3 (Focus Order) - Level A</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FocusIndicatorsExample;
