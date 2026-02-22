/**
 * Hover Effects Test
 * Task: 4.5.1 - Add hover animations to buttons (scale, color)
 * Requirement: FR-ANIM-4 - Apply smooth scale or color transitions on hover
 * 
 * This test verifies that hover effects CSS file exists and is properly configured
 * Note: CSS styles are not loaded in JSDOM test environment, so we verify the file structure
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Hover Effects Configuration', () => {
  it('should have hoverEffects.css file', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    expect(existsSync(cssPath)).toBe(true);
  });

  it('should import hoverEffects.css in index.css', () => {
    const indexCssPath = join(process.cwd(), 'src', 'index.css');
    const indexCssContent = readFileSync(indexCssPath, 'utf-8');
    expect(indexCssContent).toContain("@import './styles/hoverEffects.css'");
  });

  it('should have hover styles for links', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('a:hover');
    expect(cssContent).toContain('[role="link"]:hover');
  });

  it('should have hover styles for cards', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('.card:hover');
    expect(cssContent).toContain('transform: translateY(-5px)');
  });

  it('should have hover styles for buttons', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    // Button hover styles are in buttonAnimations.css
    const buttonCssPath = join(process.cwd(), 'src', 'styles', 'buttonAnimations.css');
    const buttonCssContent = readFileSync(buttonCssPath, 'utf-8');
    expect(buttonCssContent).toContain('button:hover');
    expect(buttonCssContent).toContain('transform: scale');
  });

  it('should have hover styles for form inputs', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('input:not([type="checkbox"]):not([type="radio"]):hover');
    expect(cssContent).toContain('border-color');
  });

  it('should have hover styles for checkboxes and radios', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('input[type="checkbox"]:hover');
    expect(cssContent).toContain('input[type="radio"]:hover');
    expect(cssContent).toContain('transform: scale(1.1)');
  });

  it('should have hover styles for icons', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('.icon-interactive:hover');
    expect(cssContent).toContain('[class*="icon-btn"]:hover');
  });

  it('should have hover styles for tabs', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('[role="tab"]:hover');
    expect(cssContent).toContain('.tab:hover');
  });

  it('should have hover styles for badges', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('.badge:hover');
    expect(cssContent).toContain('[class*="badge"]:hover');
  });

  it('should have hover styles for avatars', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('.avatar:hover');
    expect(cssContent).toContain('[class*="avatar"]:hover');
  });

  it('should have hover styles for notifications', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('.notification:hover');
    expect(cssContent).toContain('[class*="notification-"]:hover');
  });

  it('should have dark mode hover styles', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('.dark a:hover');
    expect(cssContent).toContain('.dark .card:hover');
  });

  it('should have reduced motion support', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssContent).toContain('transform: none !important');
  });

  it('should have touch device optimization', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('@media (hover: none) and (pointer: coarse)');
  });

  it('should have GPU acceleration optimization', () => {
    const cssPath = join(process.cwd(), 'src', 'styles', 'hoverEffects.css');
    const cssContent = readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('will-change: transform');
    expect(cssContent).toContain('backface-visibility: hidden');
  });
});

describe('Hover Effects in Components', () => {
  it('should render elements with hover-enabled classes', () => {
    render(
      <div>
        <button className="btn">Test Button</button>
        <a href="#test" className="link">Test Link</a>
        <div className="card">Test Card</div>
        <span className="icon-interactive" role="button" tabIndex={0}>🔍</span>
        <input type="text" placeholder="Test Input" />
        <input type="checkbox" aria-label="Test Checkbox" />
        <button role="tab" className="tab">Test Tab</button>
        <span className="badge">New</span>
        <img src="/test.jpg" alt="User Avatar" className="avatar" />
        <div className="notification">Test Notification</div>
      </div>
    );
    
    // Verify elements are rendered with correct classes
    expect(screen.getByRole('button', { name: 'Test Button' })).toHaveClass('btn');
    expect(screen.getByRole('link')).toHaveClass('link');
    expect(screen.getByText('Test Card')).toHaveClass('card');
    expect(screen.getByRole('button', { name: '🔍' })).toHaveClass('icon-interactive');
    expect(screen.getByPlaceholderText('Test Input')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('tab')).toHaveClass('tab');
    expect(screen.getByText('New')).toHaveClass('badge');
    expect(screen.getByAltText('User Avatar')).toHaveClass('avatar');
    expect(screen.getByText('Test Notification')).toHaveClass('notification');
  });
});
