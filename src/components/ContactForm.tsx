'use client';

import { useState } from 'react';
import { useRecaptcha } from './RecaptchaProvider';
import Button from './Button';
import Input from './Input';
import Textarea from './ui/Textarea';
import { isValidEmail } from '@/lib/utils';

interface ContactFormProps {
  onSubmit?: (data: { name: string; email: string; message: string }) => Promise<void>;
  className?: string;
}

export default function ContactForm({ onSubmit, className }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { executeRecaptcha } = useRecaptcha();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Execute reCAPTCHA
      const recaptchaToken = await executeRecaptcha('contact_form');
      
      if (!recaptchaToken) {
        throw new Error('reCAPTCHA verification failed');
      }

      // Submit form data
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default API submission
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            recaptchaToken,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit form');
        }
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Textarea
          label="Message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          error={errors.message}
          required
        />

        <Button type="submit" loading={isSubmitting} fullWidth>
          Send Message
        </Button>

        {submitStatus === 'success' && (
          <p className="text-sm text-success-600">Message sent successfully!</p>
        )}

        {submitStatus === 'error' && (
          <p className="text-sm text-error-600">Failed to send message. Please try again.</p>
        )}
      </div>
    </form>
  );
}
