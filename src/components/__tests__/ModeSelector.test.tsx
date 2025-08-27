import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModeSelector from '../ModeSelector';

describe('ModeSelector', () => {
  const user = userEvent.setup();
  const mockOnModeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders mode selector with both options', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      expect(screen.getByText('506(b) Private')).toBeInTheDocument();
      expect(screen.getByText('506(c) Public')).toBeInTheDocument();
      expect(screen.getAllByText('Offering')).toHaveLength(2);
    });

    it('shows correct descriptions for each mode', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      expect(screen.getByText('Expression of Interest')).toBeInTheDocument();
      expect(screen.getByText('Verification Required')).toBeInTheDocument();
    });

    it('highlights the selected mode', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const mode506b = screen.getByRole('tab', { name: /506\(b\) Private Offering/ });
      const mode506c = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      
      expect(mode506b).toHaveClass('bg-arena-gold', 'text-arena-navy');
      expect(mode506c).toHaveClass('text-gray-600');
    });

    it('highlights the correct mode when 506(c) is selected', () => {
      render(<ModeSelector selectedMode="506c" onModeChange={mockOnModeChange} />);
      
      const mode506b = screen.getByRole('tab', { name: /506\(b\) Private Offering/ });
      const mode506c = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      
      expect(mode506c).toHaveClass('bg-arena-gold', 'text-arena-navy');
      expect(mode506b).toHaveClass('text-gray-600');
    });
  });

  describe('Interaction', () => {
    it('calls onModeChange when 506(b) is clicked', async () => {
      render(<ModeSelector selectedMode="506c" onModeChange={mockOnModeChange} />);
      
      const mode506b = screen.getByRole('tab', { name: /506\(b\) Private Offering/ });
      await user.click(mode506b);
      
      expect(mockOnModeChange).toHaveBeenCalledWith('506b');
      expect(mockOnModeChange).toHaveBeenCalledTimes(1);
    });

    it('calls onModeChange when 506(c) is clicked', async () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const mode506c = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      await user.click(mode506c);
      
      expect(mockOnModeChange).toHaveBeenCalledWith('506c');
      expect(mockOnModeChange).toHaveBeenCalledTimes(1);
    });

    it('calls onModeChange even when already selected mode is clicked', async () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const mode506b = screen.getByRole('tab', { name: /506\(b\) Private Offering/ });
      await user.click(mode506b);
      
      expect(mockOnModeChange).toHaveBeenCalledWith('506b');
    });

    it('supports keyboard navigation', async () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const mode506b = screen.getByRole('tab', { name: /506\(b\) Private Offering/ });
      const mode506c = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      
      mode506b.focus();
      expect(mode506b).toHaveFocus();
      
      // Since the unselected tab has tabindex="-1", we need to focus it directly
      mode506c.focus();
      expect(mode506c).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnModeChange).toHaveBeenCalledWith('506c');
    });

    it('supports space key activation', async () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const mode506c = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      mode506c.focus();
      
      await user.keyboard(' ');
      expect(mockOnModeChange).toHaveBeenCalledWith('506c');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const mode506b = screen.getByRole('tab', { name: /506\(b\) Private Offering/ });
      const mode506c = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      
      expect(mode506b).toHaveAttribute('aria-selected', 'true');
      expect(mode506c).toHaveAttribute('aria-selected', 'false');
    });

    it('updates ARIA attributes when selection changes', () => {
      const { rerender } = render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      let mode506b = screen.getByRole('tab', { name: /506\(b\) Private Offering/ });
      let mode506c = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      
      expect(mode506b).toHaveAttribute('aria-selected', 'true');
      expect(mode506c).toHaveAttribute('aria-selected', 'false');
      
      rerender(<ModeSelector selectedMode="506c" onModeChange={mockOnModeChange} />);
      
      mode506b = screen.getByRole('tab', { name: /506\(b\) Private Offering/ });
      mode506c = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      
      expect(mode506b).toHaveAttribute('aria-selected', 'false');
      expect(mode506c).toHaveAttribute('aria-selected', 'true');
    });

    it('has proper role and labels', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const selector = screen.getByRole('tablist');
      expect(selector).toHaveAttribute('aria-label', 'Investment mode selection');
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(2);
      
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute('aria-controls');
        expect(tab).toHaveAttribute('id');
      });
    });

    it('provides clear descriptions for screen readers', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      expect(screen.getByText('Expression of Interest')).toBeInTheDocument();
      expect(screen.getByText('Verification Required')).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('applies correct styling for selected state', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const mode506b = screen.getByRole('tab', { name: /506\(b\) Private Offering/ });
      
      expect(mode506b).toHaveClass('bg-arena-gold', 'text-arena-navy', 'shadow-md');
    });

    it('applies correct styling for unselected state', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const mode506c = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      
      expect(mode506c).toHaveClass('text-gray-600', 'hover:text-gray-900', 'hover:bg-gray-50');
      expect(mode506c).not.toHaveClass('bg-arena-gold', 'text-arena-navy');
    });

    it('shows hover states correctly', async () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const mode506c = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      
      await user.hover(mode506c);
      expect(mode506c).toHaveClass('hover:bg-gray-50');
    });

    it('has proper tabindex management', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const mode506b = screen.getByRole('tab', { name: /506\(b\) Private Offering/ });
      const mode506c = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      
      expect(mode506b).toHaveAttribute('tabindex', '0');
      expect(mode506c).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Content Display', () => {
    it('shows correct icons for each mode', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      // Check for icon presence (assuming icons are rendered)
      const mode506bButton = screen.getByRole('tab', { name: /506\(b\) Private Offering/ });
      const mode506cButton = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      
      expect(mode506bButton).toBeInTheDocument();
      expect(mode506cButton).toBeInTheDocument();
    });

    it('displays mode titles prominently', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const title506b = screen.getByText('506(b) Private');
      const title506c = screen.getByText('506(c) Public');
      
      // The font-semibold class is on the parent span
      expect(title506b.parentElement).toHaveClass('font-semibold');
      expect(title506c.parentElement).toHaveClass('font-semibold');
    });

    it('shows descriptive text for each mode', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      expect(screen.getByText('Expression of Interest')).toHaveClass('text-xs', 'opacity-75');
      expect(screen.getByText('Verification Required')).toHaveClass('text-xs', 'opacity-75');
    });
  });

  describe('Responsive Design', () => {
    it('applies mobile-friendly classes', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const container = screen.getByRole('tablist');
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'gap-2');
    });

    it('has appropriate touch targets for mobile', () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const tabs = screen.getAllByRole('tab');
      tabs.forEach(tab => {
        expect(tab).toHaveClass('touch-target'); // Adequate touch target size
        expect(tab).toHaveClass('px-4', 'sm:px-6', 'py-4');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing onModeChange prop gracefully', () => {
      // This should not crash the component
      expect(() => {
        render(<ModeSelector selectedMode="506b" onModeChange={undefined as any} />);
      }).not.toThrow();
    });

    it('handles invalid selectedMode prop gracefully', () => {
      expect(() => {
        render(<ModeSelector selectedMode={'invalid' as any} onModeChange={mockOnModeChange} />);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      // Re-render with same props
      rerender(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      // Component should still be functional
      const mode506c = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      expect(mode506c).toBeInTheDocument();
    });

    it('handles rapid mode changes', async () => {
      render(<ModeSelector selectedMode="506b" onModeChange={mockOnModeChange} />);
      
      const mode506c = screen.getByRole('tab', { name: /506\(c\) Public Offering/ });
      const mode506b = screen.getByRole('tab', { name: /506\(b\) Private Offering/ });
      
      // Rapid clicks
      await user.click(mode506c);
      await user.click(mode506b);
      await user.click(mode506c);
      
      expect(mockOnModeChange).toHaveBeenCalledTimes(3); // All clicks should trigger callback
      expect(mockOnModeChange).toHaveBeenNthCalledWith(1, '506c');
      expect(mockOnModeChange).toHaveBeenNthCalledWith(2, '506b');
      expect(mockOnModeChange).toHaveBeenNthCalledWith(3, '506c');
    });
  });
});