'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  User, 
  MessageSquare, 
  Send,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // In a real implementation, this would send the email to info@thearenafund.com
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setSubmitError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="arena-section bg-gradient-to-br from-white via-arena-cream to-white">
        <div className="arena-container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="arena-display text-arena-navy">
              Contact <span className="arena-gradient-text">Us</span>
            </h1>
            <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
              Have questions about our buyer validation methodology or investment opportunities? 
              Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      <section className="arena-section-lg bg-gradient-to-br from-white via-arena-cream to-white">
        <div className="arena-container">
          <div className="max-w-4xl mx-auto">
            <div className="arena-card p-6 md:p-8">
              {submitSuccess && (
                <div className="mb-6 p-4 bg-arena-sunrise border border-arena-hunter-green rounded-xl">
                  <p className="text-arena-hunter-green font-medium flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Thank you for your message! We'll get back to you soon.
                  </p>
                </div>
              )}
              
              {submitError && (
                <div className="mb-6 p-4 bg-arena-foggy-pith border border-arena-bright-umber rounded-xl">
                  <p className="text-arena-bright-umber font-medium flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {submitError}
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-arena-gold transition-colors text-base"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-arena-gold transition-colors text-base"
                      placeholder="your.email@company.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-base font-medium text-gray-700 mb-2">Message</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3">
                      <MessageSquare className="h-4 w-4 text-gray-400" />
                    </div>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-arena-gold focus:border-arena-gold transition-colors text-base"
                      placeholder="How can we help you?"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-arena-navy text-white font-semibold px-6 py-3 rounded-lg hover:bg-arena-navy-dark transition-all duration-300 focus:ring-2 focus:ring-arena-gold focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2 inline" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CTA Section */}
      <section className="arena-section-lg bg-gradient-to-br from-arena-cream to-white">
        <div className="arena-container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="arena-headline">Have Questions?</h2>
            <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
              Check out our comprehensive FAQ section for answers to common questions about 
              our investment process and methodology.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="/faq" 
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg bg-arena-navy text-white hover:bg-arena-navy-light transition-all duration-300"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Visit FAQ Section
              </Link>
              <Link 
                href="/apply" 
                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg border-2 border-arena-navy text-arena-navy hover:bg-arena-navy hover:text-white transition-all duration-300"
              >
                <FileText className="w-4 h-4 mr-2" />
                Apply for Funding
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
