# Certificates Gallery Filtering - Quick Start Guide

## 🚀 5-Minute Setup

### Backend (Already Done ✅)

The backend API has been updated to support filtering. No additional setup needed!

**API Endpoint**: `GET /api/certificates/user/:userId`

**Query Parameters**:
- `type`: Course category (e.g., "Programming")
- `year`: Issue year (e.g., 2024)
- `status`: Certificate status ("active", "revoked", "expired")

### Frontend Usage

#### 1. Import Components

```jsx
import FilterPanel from '../components/Certificates/FilterPanel';
import '../components/Certificates/FilterPanel.css';
```

#### 2. Add State

```jsx
const [filters, setFilters] = useState({ types: [], years: [], statuses: [] });
const [filteredCertificates, setFilteredCertificates] = useState([]);
```

#### 3. Handle Filter Changes

```jsx
const handleFilterChange = (newFilters) => {
  setFilters(newFilters);
  
  // Apply filters to your certificates
  let filtered = [...certificates];
  
  if (newFilters.types.length > 0) {
    filtered = filtered.filter(cert => 
      newFilters.types.includes(cert.courseCategory)
    );
  }
  
  if (newFilters.years.length > 0) {
    filtered = filtered.filter(cert => {
      const certYear = new Date(cert.issueDate).getFullYear();
      return newFilters.years.includes(certYear);
    });
  }
  
  if (newFilters.statuses.length > 0) {
    filtered = filtered.filter(cert => 
      newFilters.statuses.includes(cert.status)
    );
  }
  
  setFilteredCertificates(filtered);
};
```

#### 4. Render FilterPanel

```jsx
<FilterPanel 
  onFilterChange={handleFilterChange}
  totalCount={filteredCertificates.length}
/>
```

### Complete Example

```jsx
import React, { useState, useEffect } from 'react';
import FilterPanel from '../components/Certificates/FilterPanel';

const MyCertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  
  // Fetch certificates
  useEffect(() => {
    fetch('/api/certificates/user/123', {
      headers: { 'Authorization': 'Bearer <token>' }
    })
      .then(res => res.json())
      .then(data => {
        setCertificates(data.certificates);
        setFilteredCertificates(data.certificates);
      });
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (filters) => {
    let filtered = [...certificates];
    
    if (filters.types.length > 0) {
      filtered = filtered.filter(cert => 
        filters.types.includes(cert.courseCategory)
      );
    }
    
    if (filters.years.length > 0) {
      filtered = filtered.filter(cert => {
        const year = new Date(cert.issueDate).getFullYear();
        return filters.years.includes(year);
      });
    }
    
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(cert => 
        filters.statuses.includes(cert.status)
      );
    }
    
    setFilteredCertificates(filtered);
  };
  
  return (
    <div>
      <FilterPanel 
        onFilterChange={handleFilterChange}
        totalCount={filteredCertificates.length}
      />
      
      <div className="certificates-grid">
        {filteredCertificates.map(cert => (
          <div key={cert.certificateId}>
            {/* Your certificate card */}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🎨 Styling

The FilterPanel comes with complete styling. Just import the CSS:

```jsx
import '../components/Certificates/FilterPanel.css';
```

**Features**:
- ✅ Responsive (Mobile, Tablet, Desktop)
- ✅ Dark mode support
- ✅ RTL/LTR support
- ✅ Accessibility compliant

## 🌍 Multi-Language

The FilterPanel automatically detects the language from `useApp()` context and displays translations for:
- Arabic (ar)
- English (en)
- French (fr)

## 📱 Responsive Design

The component is fully responsive:
- **Desktop**: Sidebar layout
- **Tablet**: Stacked layout
- **Mobile**: Full-width layout

## ✅ Features

- ✅ Multi-select filtering
- ✅ Active filters as removable chips
- ✅ Clear all filters button
- ✅ Persistent filters (localStorage)
- ✅ Real-time updates
- ✅ Results count display

## 🔗 API Integration

### Client-Side Filtering (Recommended for < 100 certificates)

```jsx
// Fetch all certificates once
const certificates = await fetch('/api/certificates/user/123');

// Filter client-side
const filtered = certificates.filter(/* your logic */);
```

### Server-Side Filtering (Recommended for > 100 certificates)

```jsx
// Build query string
const params = new URLSearchParams();
if (filters.types.length > 0) params.append('type', filters.types[0]);
if (filters.years.length > 0) params.append('year', filters.years[0]);
if (filters.statuses.length > 0) params.append('status', filters.statuses[0]);

// Fetch filtered certificates
const certificates = await fetch(`/api/certificates/user/123?${params}`);
```

## 📚 Full Documentation

For complete documentation, see:
- `docs/Certificates/CERTIFICATES_GALLERY_FILTERING.md`

## 🎯 Example

See working example:
- `frontend/src/examples/CertificatesGalleryExample.jsx`

---

**That's it!** You're ready to use certificate filtering in your app. 🎉
