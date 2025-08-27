import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SuccessMessage, NewsletterSuccessMessage } from '../SuccessMessage';

describe('SuccessMessage', () => {
  it('renders with title and message', () => {
    render(
      <SuccessMessage
        title="Success!"
        message="Operation completed successfully"
      />
    );

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
  });

  it('renders with icon by default', () => {
    render(
      <SuccessMessage
        title="Success!"
        message="Operation completed successfully"
      />
    );

    const icon = screen.getByRole('status').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    render(
      <SuccessMessage
        title="Success!"
        message="Operation completed successfully"
        showIcon={false}
      />
    );

    const icon = screen.getByRole('status').querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <SuccessMessage
        title="Success!"
        message="Operation completed successfully"
        onClose={onClose}
      />
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onAction when action button is clicked', () => {
    const onAction = vi.fn();
    render(
      <SuccessMessage
        title="Success!"
        message="Operation completed successfully"
        onAction={onAction}
        actionLabel="Continue"
      />
    );

    const actionButton = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(actionButton);

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('auto-closes after specified delay', async () => {
    const onClose = vi.fn();
    render(
      <SuccessMessage
        title="Success!"
        message="Operation completed successfully"
        onClose={onClose}
        autoClose={true}
        autoCloseDelay={100}
      />
    );

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    }, { timeout: 200 });
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(
      <SuccessMessage
        title="Success!"
        message="Operation completed successfully"
        variant="modal"
      />
    );

    let container = screen.getByRole('status');
    expect(container).toHaveClass('text-center', 'p-6');

    rerender(
      <SuccessMessage
        title="Success!"
        message="Operation completed successfully"
        variant="inline"
      />
    );

    container = screen.getByRole('status');
    expect(container).toHaveClass('p-4', 'border', 'border-green-200', 'bg-green-50', 'rounded-md');

    rerender(
      <SuccessMessage
        title="Success!"
        message="Operation completed successfully"
        variant="toast"
      />
    );

    container = screen.getByRole('status');
    expect(container).toHaveClass('fixed', 'top-4', 'right-4', 'z-50');
  });

  it('renders toast variant with close button', () => {
    const onClose = vi.fn();
    render(
      <SuccessMessage
        title="Success!"
        message="Operation completed successfully"
        variant="toast"
        onClose={onClose}
      />
    );

    const closeButtons = screen.getAllByRole('button');
    expect(closeButtons).toHaveLength(2); // Main action button + toast close button

    const toastCloseButton = closeButtons.find(button => 
      button.getAttribute('aria-label') === 'Close success message'
    );
    expect(toastCloseButton).toBeInTheDocument();

    fireEvent.click(toastCloseButton!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(
      <SuccessMessage
        title="Success!"
        message="Operation completed successfully"
        onClose={vi.fn()}
      />
    );

    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-atomic', 'true');

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-describedby', 'success-title success-description');
  });
});

describe('NewsletterSuccessMessage', () => {
  it('renders with newsletter-specific content', () => {
    render(<NewsletterSuccessMessage />);

    expect(screen.getByText('Successfully Subscribed!')).toBeInTheDocument();
    expect(screen.getByText(/Thank you for subscribing to Arena Fund insights/)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<NewsletterSuccessMessage onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses modal variant by default', () => {
    render(<NewsletterSuccessMessage />);

    const container = screen.getByRole('status');
    expect(container).toHaveClass('text-center', 'p-6');
  });
});