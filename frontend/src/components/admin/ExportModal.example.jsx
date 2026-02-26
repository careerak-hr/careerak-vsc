import React, { useState } from 'react';
import ExportModal from './ExportModal';
import { exportAndDownload, showSuccessNotification, showErrorNotification } from '../../services/exportService';
import { useApp } from '../../context/AppContext';

/**
 * ExportModal Usage Examples
 * 
 * Demonstrates how to use the ExportModal component with the export service.
 */

// Example 1: Basic Usage
export const BasicExportExample = () => {
  const { language } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataType, setDataType] = useState('users');

  const handleExport = async (config) => {
    try {
      await exportAndDownload(dataType, config);
      showSuccessNotification(null, language);
    } catch (error) {
      showErrorNotification(error.message, language);
    }
  };

  return (
    <div>
      <h2>Basic Export Example</h2>
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
          <option value="users">Users</option>
          <option value="jobs">Jobs</option>
          <option value="applications">Applications</option>
          <option value="courses">Courses</option>
          <option value="activity_log">Activity Log</option>
        </select>
        
        <button onClick={() => setIsModalOpen(true)}>
          Export {dataType}
        </button>
      </div>

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataType={dataType}
        onExport={handleExport}
      />
    </div>
  );
};

// Example 2: Export with Progress Tracking
export const ExportWithProgressExample = () => {
  const { language } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progress, setProgress] = useState({ stage: '', progress: 0 });

  const handleExport = async (config) => {
    try {
      await exportAndDownload('users', config, (progressInfo) => {
        setProgress(progressInfo);
      });
      showSuccessNotification(null, language);
      setProgress({ stage: '', progress: 0 });
    } catch (error) {
      showErrorNotification(error.message, language);
      setProgress({ stage: '', progress: 0 });
    }
  };

  return (
    <div>
      <h2>Export with Progress Tracking</h2>
      
      <button onClick={() => setIsModalOpen(true)}>
        Export Users
      </button>

      {progress.stage && (
        <div style={{ marginTop: '12px' }}>
          <div>Stage: {progress.stage}</div>
          <div>Progress: {progress.progress}%</div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#E3DAD1',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress.progress}%`,
              height: '100%',
              backgroundColor: '#D48161',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataType="users"
        onExport={handleExport}
      />
    </div>
  );
};

// Example 3: Export Button in Table
export const ExportButtonInTableExample = () => {
  const { language } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState('');

  const handleExportClick = (dataType) => {
    setSelectedDataType(dataType);
    setIsModalOpen(true);
  };

  const handleExport = async (config) => {
    try {
      await exportAndDownload(selectedDataType, config);
      showSuccessNotification(null, language);
    } catch (error) {
      showErrorNotification(error.message, language);
    }
  };

  return (
    <div>
      <h2>Export Button in Table</h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#E3DAD1' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>Data Type</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Records</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '12px' }}>Users</td>
            <td style={{ padding: '12px' }}>1,234</td>
            <td style={{ padding: '12px' }}>
              <button onClick={() => handleExportClick('users')}>
                📊 Export
              </button>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px' }}>Jobs</td>
            <td style={{ padding: '12px' }}>567</td>
            <td style={{ padding: '12px' }}>
              <button onClick={() => handleExportClick('jobs')}>
                📊 Export
              </button>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px' }}>Applications</td>
            <td style={{ padding: '12px' }}>2,345</td>
            <td style={{ padding: '12px' }}>
              <button onClick={() => handleExportClick('applications')}>
                📊 Export
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataType={selectedDataType}
        onExport={handleExport}
      />
    </div>
  );
};

// Example 4: Export with Custom Error Handling
export const ExportWithCustomErrorHandlingExample = () => {
  const { language } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async (config) => {
    setError('');
    
    try {
      await exportAndDownload('users', config);
      showSuccessNotification(null, language);
    } catch (error) {
      // Custom error handling
      if (error.message.includes('Authentication')) {
        setError('Please log in again to export data');
      } else if (error.message.includes('403')) {
        setError('You do not have permission to export this data');
      } else if (error.message.includes('Network')) {
        setError('Network error. Please check your connection');
      } else {
        setError(error.message);
      }
      
      showErrorNotification(error.message, language);
    }
  };

  return (
    <div>
      <h2>Export with Custom Error Handling</h2>
      
      <button onClick={() => setIsModalOpen(true)}>
        Export Users
      </button>

      {error && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#ff000020',
          border: '2px solid #ff0000',
          borderRadius: '8px',
          color: '#ff0000'
        }}>
          {error}
        </div>
      )}

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataType="users"
        onExport={handleExport}
      />
    </div>
  );
};

// Example 5: Multiple Export Buttons
export const MultipleExportButtonsExample = () => {
  const { language } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataType, setDataType] = useState('');

  const handleExport = async (config) => {
    try {
      await exportAndDownload(dataType, config);
      showSuccessNotification(null, language);
    } catch (error) {
      showErrorNotification(error.message, language);
    }
  };

  const exportButtons = [
    { type: 'users', label: 'Export Users', icon: '👥' },
    { type: 'jobs', label: 'Export Jobs', icon: '💼' },
    { type: 'applications', label: 'Export Applications', icon: '📝' },
    { type: 'courses', label: 'Export Courses', icon: '📚' },
    { type: 'activity_log', label: 'Export Activity Log', icon: '📋' }
  ];

  return (
    <div>
      <h2>Multiple Export Buttons</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {exportButtons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => {
              setDataType(btn.type);
              setIsModalOpen(true);
            }}
            style={{
              padding: '12px 20px',
              backgroundColor: '#D48161',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{btn.icon}</span>
            <span>{btn.label}</span>
          </button>
        ))}
      </div>

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dataType={dataType}
        onExport={handleExport}
      />
    </div>
  );
};

// Demo Component
const ExportModalDemo = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>ExportModal Component Examples</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <BasicExportExample />
        <hr />
        <ExportWithProgressExample />
        <hr />
        <ExportButtonInTableExample />
        <hr />
        <ExportWithCustomErrorHandlingExample />
        <hr />
        <MultipleExportButtonsExample />
      </div>
    </div>
  );
};

export default ExportModalDemo;
