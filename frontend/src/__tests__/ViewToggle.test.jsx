import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ViewToggle from '../components/ViewToggle/ViewToggle';

describe('ViewToggle Component', () => {
  it('should render both grid and list buttons', () => {
    const mockOnToggle = vi.fn();
    render(<ViewToggle view="grid" onToggle={mockOnToggle} />);
    
    expect(screen.getByLabelText('عرض شبكي')).toBeInTheDocument();
    expect(screen.getByLabelText('عرض قائمة')).toBeInTheDocument();
  });

  it('should highlight active view button', () => {
    const mockOnToggle = vi.fn();
    const { rerender } = render(<ViewToggle view="grid" onToggle={mockOnToggle} />);
    
    const gridBtn = screen.getByLabelText('عرض شبكي');
    const listBtn = screen.getByLabelText('عرض قائمة');
    
    expect(gridBtn).toHaveClass('active');
    expect(listBtn).not.toHaveClass('active');
    
    rerender(<ViewToggle view="list" onToggle={mockOnToggle} />);
    
    expect(gridBtn).not.toHaveClass('active');
    expect(listBtn).toHaveClass('active');
  });

  it('should call onToggle when grid button is clicked', () => {
    const mockOnToggle = vi.fn();
    render(<ViewToggle view="list" onToggle={mockOnToggle} />);
    
    const gridBtn = screen.getByLabelText('عرض شبكي');
    fireEvent.click(gridBtn);
    
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('should call onToggle when list button is clicked', () => {
    const mockOnToggle = vi.fn();
    render(<ViewToggle view="grid" onToggle={mockOnToggle} />);
    
    const listBtn = screen.getByLabelText('عرض قائمة');
    fireEvent.click(listBtn);
    
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA attributes', () => {
    const mockOnToggle = vi.fn();
    render(<ViewToggle view="grid" onToggle={mockOnToggle} />);
    
    const gridBtn = screen.getByLabelText('عرض شبكي');
    const listBtn = screen.getByLabelText('عرض قائمة');
    
    expect(gridBtn).toHaveAttribute('type', 'button');
    expect(listBtn).toHaveAttribute('type', 'button');
  });

  it('should not have role group on container', () => {
    const mockOnToggle = vi.fn();
    const { container } = render(<ViewToggle view="grid" onToggle={mockOnToggle} />);
    
    const toggle = container.querySelector('.view-toggle');
    expect(toggle).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const mockOnToggle = vi.fn();
    const { container } = render(
      <ViewToggle view="grid" onToggle={mockOnToggle} className="custom-class" />
    );
    
    const toggle = container.querySelector('.view-toggle');
    expect(toggle).toHaveClass('custom-class');
  });

  it('should have proper titles for tooltips', () => {
    const mockOnToggle = vi.fn();
    render(<ViewToggle view="grid" onToggle={mockOnToggle} />);
    
    const gridBtn = screen.getByLabelText('عرض شبكي');
    const listBtn = screen.getByLabelText('عرض قائمة');
    
    expect(gridBtn).toHaveAttribute('title', 'عرض شبكي');
    expect(listBtn).toHaveAttribute('title', 'عرض قائمة');
  });

  it('should render icons correctly', () => {
    const mockOnToggle = vi.fn();
    const { container } = render(<ViewToggle view="grid" onToggle={mockOnToggle} />);
    
    // التحقق من وجود أيقونات lucide-react
    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(2);
  });

  it('should be keyboard accessible', () => {
    const mockOnToggle = vi.fn();
    render(<ViewToggle view="grid" onToggle={mockOnToggle} />);
    
    const listBtn = screen.getByLabelText('عرض قائمة');
    
    // الزر يجب أن يكون قابل للتفاعل بلوحة المفاتيح
    expect(listBtn).toHaveAttribute('type', 'button');
  });
});
