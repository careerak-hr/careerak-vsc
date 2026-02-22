/**
 * ImagePlaceholder Demo
 * 
 * Demonstrates various use cases of the ImagePlaceholder component
 */

import React from 'react';
import ImagePlaceholder from './ImagePlaceholder';

const ImagePlaceholderDemo = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>ImagePlaceholder Component Demo</h1>

      {/* Basic Usage */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Basic Usage</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h3>Default (no dimensions)</h3>
            <ImagePlaceholder />
          </div>
          <div>
            <h3>Fixed Width & Height</h3>
            <ImagePlaceholder width={200} height={200} />
          </div>
          <div>
            <h3>Width Only</h3>
            <ImagePlaceholder width={200} />
          </div>
        </div>
      </section>

      {/* Aspect Ratios */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Aspect Ratios</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h3>Square (1/1)</h3>
            <ImagePlaceholder aspectRatio="1/1" />
          </div>
          <div>
            <h3>Landscape (16/9)</h3>
            <ImagePlaceholder aspectRatio="16/9" />
          </div>
          <div>
            <h3>Portrait (3/4)</h3>
            <ImagePlaceholder aspectRatio="3/4" />
          </div>
        </div>
      </section>

      {/* Presets */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Using Presets</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div>
            <h3>PROFILE_SMALL</h3>
            <ImagePlaceholder preset="PROFILE_SMALL" />
          </div>
          <div>
            <h3>PROFILE_MEDIUM</h3>
            <ImagePlaceholder preset="PROFILE_MEDIUM" />
          </div>
          <div>
            <h3>PROFILE_LARGE</h3>
            <ImagePlaceholder preset="PROFILE_LARGE" />
          </div>
          <div>
            <h3>LOGO_MEDIUM</h3>
            <ImagePlaceholder preset="LOGO_MEDIUM" />
          </div>
        </div>
      </section>

      {/* Rounded */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Rounded (Profile Pictures)</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ImagePlaceholder width={100} height={100} rounded />
          <ImagePlaceholder width={150} height={150} rounded />
          <ImagePlaceholder preset="PROFILE_MEDIUM" rounded />
        </div>
      </section>

      {/* Without Icon */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Without Icon</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <ImagePlaceholder width={200} height={200} showIcon={false} />
          <ImagePlaceholder aspectRatio="16/9" showIcon={false} />
        </div>
      </section>

      {/* Custom Styling */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Custom Styling</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h3>Custom Background</h3>
            <ImagePlaceholder
              width={200}
              height={200}
              style={{ backgroundColor: '#fef3c7' }}
            />
          </div>
          <div>
            <h3>With Border</h3>
            <ImagePlaceholder
              width={200}
              height={200}
              style={{ border: '4px solid #304B60', borderRadius: '12px' }}
            />
          </div>
          <div>
            <h3>Custom Class</h3>
            <ImagePlaceholder
              width={200}
              height={200}
              className="shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Real-world Examples */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Real-world Examples</h2>
        
        {/* Job Card */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>Job Card</h3>
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '1rem',
            maxWidth: '400px'
          }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <ImagePlaceholder preset="LOGO_MEDIUM" rounded />
              <div style={{ flex: 1 }}>
                <div style={{ height: '20px', backgroundColor: '#e5e7eb', marginBottom: '0.5rem' }}></div>
                <div style={{ height: '16px', backgroundColor: '#e5e7eb', width: '60%' }}></div>
              </div>
            </div>
            <ImagePlaceholder aspectRatio="16/9" />
          </div>
        </div>

        {/* Profile Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>Profile Header</h3>
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '1rem',
            maxWidth: '600px'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <ImagePlaceholder preset="PROFILE_LARGE" rounded />
              <div style={{ flex: 1 }}>
                <div style={{ height: '24px', backgroundColor: '#e5e7eb', marginBottom: '0.5rem', width: '40%' }}></div>
                <div style={{ height: '16px', backgroundColor: '#e5e7eb', width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div>
          <h3>Gallery Grid</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
            gap: '1rem',
            maxWidth: '800px'
          }}>
            <ImagePlaceholder aspectRatio="1/1" />
            <ImagePlaceholder aspectRatio="1/1" />
            <ImagePlaceholder aspectRatio="1/1" />
            <ImagePlaceholder aspectRatio="1/1" />
            <ImagePlaceholder aspectRatio="1/1" />
            <ImagePlaceholder aspectRatio="1/1" />
          </div>
        </div>
      </section>

      {/* Dark Mode Preview */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Dark Mode Preview</h2>
        <div className="dark" style={{ 
          backgroundColor: '#1a1a1a', 
          padding: '2rem', 
          borderRadius: '8px' 
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <ImagePlaceholder width={200} height={200} />
            <ImagePlaceholder aspectRatio="16/9" />
            <ImagePlaceholder preset="PROFILE_MEDIUM" rounded />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ImagePlaceholderDemo;
