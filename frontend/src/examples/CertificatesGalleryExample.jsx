/**
 * Certificates Gallery with Filtering - Usage Example
 * 
 * This example demonstrates how to use the FilterPanel component
 * and integrate it with the certificates gallery.
 * 
 * Features:
 * - Filter by type (course category)
 * - Filter by year
 * - Filter by status (active, revoked, expired)
 * - Multi-select filtering
 * - Active filters display as chips
 * - Clear all filters button
 * - Persistent filters (localStorage)
 * - Real-time filtering
 * - Responsive design
 * - RTL/LTR support
 * - Dark mode support
 */

import React, { useState } from 'react';
import FilterPanel from '../components/Certificates/FilterPanel';
import '../components/Certificates/FilterPanel.css';

// Mock data for demonstration
const mockCertificates = [
  {
    certificateId: 'cert-001',
    courseName: 'React Advanced Course',
    courseCategory: 'Programming',
    issueDate: '2024-01-15',
    status: 'active',
    courseThumbnail: 'https://via.placeholder.com/300x200'
  },
  {
    certificateId: 'cert-002',
    courseName: 'UI/UX Design Fundamentals',
    courseCategory: 'Design',
    issueDate: '2023-11-20',
    status: 'active',
    courseThumbnail: 'https://via.placeholder.com/300x200'
  },
  {
    certificateId: 'cert-003',
    courseName: 'Digital Marketing Strategy',
    courseCategory: 'Marketing',
    issueDate: '2023-08-10',
    status: 'expired',
    courseThumbnail: 'https://via.placeholder.com/300x200'
  },
  {
    certificateId: 'cert-004',
    courseName: 'Python for Data Science',
    courseCategory: 'Data Science',
    issueDate: '2024-02-05',
    status: 'active',
    courseThumbnail: 'https://via.placeholder.com/300x200'
  },
  {
    certificateId: 'cert-005',
    courseName: 'Business Management',
    courseCategory: 'Business',
    issueDate: '2022-12-15',
    status: 'revoked',
    courseThumbnail: 'https://via.placeholder.com/300x200'
  }
];

const CertificatesGalleryExample = () => {
  const [filteredCertificates, setFilteredCertificates] = useState(mockCertificates);
  
  // Handle filter changes
  const handleFilterChange = (filters) => {
    console.log('Filters changed:', filters);
    
    let filtered = [...mockCertificates];
    
    // Filter by type
    if (filters.types.length > 0) {
      filtered = filtered.filter(cert => 
        filters.types.includes(cert.courseCategory)
      );
    }
    
    // Filter by year
    if (filters.years.length > 0) {
      filtered = filtered.filter(cert => {
        const certYear = new Date(cert.issueDate).getFullYear();
        return filters.years.includes(certYear);
      });
    }
    
    // Filter by status
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(cert => 
        filters.statuses.includes(cert.status)
      );
    }
    
    setFilteredCertificates(filtered);
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Certificates Gallery Example
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* Filter Panel */}
        <aside>
          <FilterPanel 
            onFilterChange={handleFilterChange}
            totalCount={filteredCertificates.length}
          />
        </aside>
        
        {/* Certificates Grid */}
        <main>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredCertificates.length === 0 ? (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '3rem',
                color: '#666'
              }}>
                No certificates match the selected filters
              </div>
            ) : (
              filteredCertificates.map(cert => (
                <div 
                  key={cert.certificateId}
                  style={{
                    background: '#E3DAD1',
                    border: '2px solid #304B60',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ 
                    position: 'relative',
                    height: '200px',
                    background: '#304B60'
                  }}>
                    <img 
                      src={cert.courseThumbnail} 
                      alt={cert.courseName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: 'white',
                      background: cert.status === 'active' ? '#28a745' : 
                                 cert.status === 'revoked' ? '#dc3545' : '#6c757d'
                    }}>
                      {cert.status}
                    </span>
                  </div>
                  
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ 
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      color: '#304B60',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {cert.courseName}
                    </h3>
                    <p style={{ 
                      fontSize: '0.95rem',
                      color: '#666',
                      margin: '0 0 1rem 0'
                    }}>
                      Issued on {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                    <p style={{ 
                      fontSize: '0.9rem',
                      color: '#666',
                      margin: '0'
                    }}>
                      Category: {cert.courseCategory}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
      
      {/* Usage Instructions */}
      <div style={{ 
        marginTop: '3rem', 
        padding: '2rem', 
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <h2>Usage Instructions</h2>
        <pre style={{ 
          background: '#fff', 
          padding: '1rem', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
{`import FilterPanel from '../components/Certificates/FilterPanel';

const MyComponent = () => {
  const [filters, setFilters] = useState({ types: [], years: [], statuses: [] });
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Apply filters to your certificates
  };
  
  return (
    <FilterPanel 
      onFilterChange={handleFilterChange}
      totalCount={filteredCertificates.length}
    />
  );
};`}
        </pre>
        
        <h3>Features:</h3>
        <ul>
          <li>✅ Multi-select filtering (type, year, status)</li>
          <li>✅ Active filters displayed as removable chips</li>
          <li>✅ Clear all filters button</li>
          <li>✅ Persistent filters (saved in localStorage)</li>
          <li>✅ Real-time filtering</li>
          <li>✅ Results count display</li>
          <li>✅ Responsive design (Mobile, Tablet, Desktop)</li>
          <li>✅ RTL/LTR support</li>
          <li>✅ Dark mode support</li>
          <li>✅ Accessibility compliant</li>
        </ul>
        
        <h3>API Integration:</h3>
        <pre style={{ 
          background: '#fff', 
          padding: '1rem', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
{`// Backend API supports filtering via query parameters:
GET /api/certificates/user/:userId?type=Programming&year=2024&status=active

// Example fetch:
const response = await fetch(
  \`\${API_URL}/api/certificates/user/\${userId}?type=\${type}&year=\${year}&status=\${status}\`,
  {
    headers: { 'Authorization': \`Bearer \${token}\` }
  }
);`}
        </pre>
      </div>
    </div>
  );
};

export default CertificatesGalleryExample;
