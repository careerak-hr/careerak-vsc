import React, { useState } from 'react';
import { OverlaySpinner } from '../components/Loading';

/**
 * OverlaySpinner Usage Examples
 * 
 * Demonstrates how to use OverlaySpinner for blocking operations
 * 
 * Requirements:
 * - FR-LOAD-4: Display centered spinner with backdrop when overlay action is processing
 * 
 * Use Cases:
 * 1. File uploads
 * 2. Data processing
 * 3. Batch operations
 * 4. Critical actions (delete, submit)
 * 5. API calls that require user to wait
 */

const OverlaySpinnerUsageExample = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Example 1: File Upload
  const handleFileUpload = async (file) => {
    setIsUploading(true);
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('File uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Example 2: Data Processing
  const handleDataProcessing = async () => {
    setIsProcessing(true);
    try {
      // Simulate data processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Data processed successfully');
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Example 3: Delete Operation
  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      // Simulate delete operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Item deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-[#304B60] dark:text-[#e0e0e0]">
        OverlaySpinner Usage Examples
      </h1>

      {/* Example 1: File Upload */}
      <section className="bg-white dark:bg-[#2d2d2d] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-[#304B60] dark:text-[#e0e0e0]">
          1. File Upload
        </h2>
        <button
          onClick={() => handleFileUpload(null)}
          className="px-6 py-3 bg-[#D48161] text-white rounded-lg font-medium hover:bg-[#D48161]/90"
        >
          Upload File
        </button>
        <OverlaySpinner
          show={isUploading}
          message="Uploading file..."
          spinnerSize="large"
          spinnerColor="accent"
        />
      </section>

      {/* Example 2: Data Processing */}
      <section className="bg-white dark:bg-[#2d2d2d] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-[#304B60] dark:text-[#e0e0e0]">
          2. Data Processing
        </h2>
        <button
          onClick={handleDataProcessing}
          className="px-6 py-3 bg-[#304B60] text-white rounded-lg font-medium hover:bg-[#304B60]/90"
        >
          Process Data
        </button>
        <OverlaySpinner
          show={isProcessing}
          message="Processing data..."
          spinnerSize="large"
          spinnerColor="primary"
        />
      </section>

      {/* Example 3: Delete Operation */}
      <section className="bg-white dark:bg-[#2d2d2d] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-[#304B60] dark:text-[#e0e0e0]">
          3. Delete Operation
        </h2>
        <button
          onClick={() => handleDelete(123)}
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
        >
          Delete Item
        </button>
        <OverlaySpinner
          show={isDeleting}
          message="Deleting..."
          spinnerSize="medium"
          spinnerColor="primary"
        />
      </section>

      {/* Example 4: Custom Backdrop Opacity */}
      <section className="bg-white dark:bg-[#2d2d2d] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-[#304B60] dark:text-[#e0e0e0]">
          4. Custom Backdrop Opacity
        </h2>
        <p className="text-sm text-[#304B60]/70 dark:text-[#e0e0e0]/70 mb-4">
          You can customize the backdrop opacity (default: 0.5)
        </p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`<OverlaySpinner
  show={isLoading}
  message="Loading..."
  backdropOpacity={0.7}
  spinnerSize="large"
  spinnerColor="accent"
/>`}
        </pre>
      </section>

      {/* Example 5: Without Message */}
      <section className="bg-white dark:bg-[#2d2d2d] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-[#304B60] dark:text-[#e0e0e0]">
          5. Without Message
        </h2>
        <p className="text-sm text-[#304B60]/70 dark:text-[#e0e0e0]/70 mb-4">
          You can show just the spinner without a message
        </p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`<OverlaySpinner
  show={isLoading}
  spinnerSize="large"
  spinnerColor="primary"
/>`}
        </pre>
      </section>

      {/* Props Documentation */}
      <section className="bg-white dark:bg-[#2d2d2d] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-[#304B60] dark:text-[#e0e0e0]">
          Props Documentation
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 text-[#304B60] dark:text-[#e0e0e0]">Prop</th>
              <th className="text-left py-2 text-[#304B60] dark:text-[#e0e0e0]">Type</th>
              <th className="text-left py-2 text-[#304B60] dark:text-[#e0e0e0]">Default</th>
              <th className="text-left py-2 text-[#304B60] dark:text-[#e0e0e0]">Description</th>
            </tr>
          </thead>
          <tbody className="text-[#304B60] dark:text-[#e0e0e0]">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 font-mono">show</td>
              <td className="py-2">boolean</td>
              <td className="py-2">false</td>
              <td className="py-2">Controls visibility of the overlay</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 font-mono">message</td>
              <td className="py-2">string</td>
              <td className="py-2">''</td>
              <td className="py-2">Optional message to display below spinner</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 font-mono">backdropOpacity</td>
              <td className="py-2">number</td>
              <td className="py-2">0.5</td>
              <td className="py-2">Opacity of the backdrop (0-1)</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 font-mono">spinnerSize</td>
              <td className="py-2">string</td>
              <td className="py-2">'large'</td>
              <td className="py-2">'small', 'medium', or 'large'</td>
            </tr>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <td className="py-2 font-mono">spinnerColor</td>
              <td className="py-2">string</td>
              <td className="py-2">'primary'</td>
              <td className="py-2">'primary', 'accent', or 'white'</td>
            </tr>
            <tr>
              <td className="py-2 font-mono">announceToScreenReader</td>
              <td className="py-2">boolean</td>
              <td className="py-2">true</td>
              <td className="py-2">Whether to announce loading to screen readers</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Best Practices */}
      <section className="bg-white dark:bg-[#2d2d2d] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-[#304B60] dark:text-[#e0e0e0]">
          Best Practices
        </h2>
        <ul className="space-y-2 text-[#304B60] dark:text-[#e0e0e0]">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Use for blocking operations that require user to wait</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Provide clear, descriptive messages (e.g., "Uploading file...", "Processing data...")</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Always set show to false when operation completes (use finally block)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Use appropriate spinner size (large for important operations)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">✗</span>
            <span>Don't use for quick operations (&lt;500ms) - use ButtonSpinner instead</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">✗</span>
            <span>Don't use for non-blocking operations - use inline loaders instead</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500">✗</span>
            <span>Don't forget to handle errors and hide the overlay</span>
          </li>
        </ul>
      </section>

      {/* Accessibility Features */}
      <section className="bg-white dark:bg-[#2d2d2d] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-[#304B60] dark:text-[#e0e0e0]">
          Accessibility Features
        </h2>
        <ul className="space-y-2 text-[#304B60] dark:text-[#e0e0e0]">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>Announces loading state to screen readers via aria-live region</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>Respects prefers-reduced-motion setting</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>Proper z-index (z-50) ensures overlay is above all content</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>Dark mode support with appropriate colors</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>Smooth fade animations (200ms) for better UX</span>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default OverlaySpinnerUsageExample;
