import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { 
  ErrorMessage, 
  NetworkErrorMessage, 
  ServerErrorMessage, 
  RateLimitErrorMessage, 
  AlreadySubscribedMessage 
} from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders with message', () => {
    render(
      <ErrorMessage message="Something went wrong" />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders with title and message', () => {
    render(
      <ErrorMessage
        title="Error"
        message="Something went wrong"
      />
    );

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders with icon by default', () => {
    render(
      <ErrorMessage message="Something went wrong" />
    );

    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    render(
      <ErrorMessage
        message="Something went wrong"
        showIcon={false}
      />
    );

    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(
      <ErrorMessage
        message="Something went wrong"
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: 'Try Again' });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(
      <ErrorMessage
        message="Something went wrong"
        onDismiss={onDismiss}
      />
    );

    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-closes after specified delay', async () => {
    const onDismiss = vi.fn();
    render(
      <ErrorMessage
        message="Something went wrong"
        onDismiss={onDismiss}
        autoClose={true}
        autoCloseDelay={100}
      />
    );

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledTimes(1);
    }, { timeout: 200 });
  });

  it('applies correct severity styles', () => {
    const { rerender } = render(
      <ErrorMessage
        message="Something went wrong"
        severity="error"
      />
    );

    let container = screen.getByRole('alert');
    expect(container).toHaveClass('bg-arena-sunrise', 'border-arena-bright-umber');

    rerender(
      <ErrorMessage
        message="Something went wrong"
        severity="warning"
      />
    );

    container = screen.getByRole('alert');
    expect(container).toHaveClass('bg-yellow-50', 'border-yellow-200');

    rerender(
      <ErrorMessage
        message="Something went wrong"
        severity="info"
      />
    );

    container = screen.getByRole('alert');
    expect(container).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(
      <ErrorMessage
        message="Something went wrong"
        variant="inline"
      />
    );

    let container = screen.getByRole('alert');
    expect(container).toHaveClass('p-4', 'border', 'rounded-md');

    rerender(
      <ErrorMessage
        message="Something went wrong"
        variant="toast"
      />
    );

    container = screen.getByRole('alert');
    expect(container).toHaveClass('fixed', 'top-4', 'right-4', 'z-50');

    rerender(
      <ErrorMessage
        message="Something went wrong"
        variant="modal"
      />
    );

    container = screen.getByRole('alert');
    expect(container).toHaveClass('text-center', 'p-6');
  });

  it('renders toast variant with close button', () => {
    const onDismiss = vi.fn();
    render(
      <ErrorMessage
        message="Something went wrong"
        variant="toast"
        onDismiss={onDismiss}
      />
    );

    const closeButtons = screen.getAllByRole('button');
    const toastCloseButton = closeButtons.find(button => 
      button.getAttribute('aria-label') === 'Close error message'
    );
    expect(toastCloseButton).toBeInTheDocument();

    fireEvent.click(toastCloseButton!);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(
      <ErrorMessage
        title="Error"
        message="Something went wrong"
        onRetry={vi.fn()}
      />
    );

    const container = screen.getByRole('alert');
    expect(container).toHaveAttribute('aria-live', 'assertive');
    expect(container).toHaveAttribute('aria-atomic', 'true');

    const button = screen.getByRole('button', { name: 'Try Again' });
    expect(button).toHaveAttribute('aria-describedby', 'error-title error-description');
  });
});

describe('NetworkErrorMessage', () => {
  it('renders with network-specific content', () => {
    render(<NetworkErrorMessage />);

    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText(/Unable to connect/)).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<NetworkErrorMessage onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: 'Try Again' });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('ServerErrorMessage', () => {
  it('renders with server-specific content', () => {
    render(<ServerErrorMessage />);

    expect(screen.getByText('Server Error')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong on our end/)).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ServerErrorMessage onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: 'Try Again' });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('RateLimitErrorMessage', () => {
  it('renders with rate limit-specific content', () => {
    render(<RateLimitErrorMessage />);

    expect(screen.getByText('Too Many Requests')).toBeInTheDocument();
    expect(screen.getByText(/too quickly/)).toBeInTheDocument();
  });

  it('auto-closes after 5 seconds', async () => {
    const onDismiss = vi.fn();
    render(<RateLimitErrorMessage onDismiss={onDismiss} />);

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledTimes(1);
    }, { timeout: 6000 });
  }, 10000);

  it('uses warning severity', () => {
    render(<RateLimitErrorMessage />);

    const container = screen.getByRole('alert');
    expect(container).toHaveClass('bg-yellow-50', 'border-yellow-200');
  });
});

describe('AlreadySubscribedMessage', () => {
  it('renders with subscription-specific content', () => {
    render(<AlreadySubscribedMessage />);

    expect(screen.getByText('Already Subscribed')).toBeInTheDocument();
    expect(screen.getByText(/already subscribed/)).toBeInTheDocument();
  });

  it('uses info severity', () => {
    render(<AlreadySubscribedMessage />);

    const container = screen.getByRole('alert');
    expect(container).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('calls onDismiss when OK button is clicked', () => {
    const onDismiss = vi.fn();
    render(<AlreadySubscribedMessage onDismiss={onDismiss} />);

    const okButton = screen.getByRole('button', { name: 'OK' });
    fireEvent.click(okButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});