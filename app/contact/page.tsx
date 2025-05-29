"use client";
import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';

type FormErrors = {
  name?: string;
  email?: string;
  message?: string;
};

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitMessage, setSubmitMessage] = useState('');

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!formData.message.trim() || formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setFormStatus('loading');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormStatus('success');
        setSubmitMessage('Message sent successfully. We will respond within 24 hours.');
        setFormData({ name: '', email: '', message: '' });
        setErrors({});
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      setFormStatus('error');
      setSubmitMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    if (formStatus !== 'idle' && formStatus !== 'loading') {
      setFormStatus('idle');
      setSubmitMessage('');
    }
  };

  const contactDetails = [
    {
      icon: Phone,
      label: 'Customer Care',
      value: '+91 (800) 123-4567',
      desc: 'Mon–Sat, 9AM–6PM IST'
    },
    {
      icon: Mail,
      label: 'Email Us',
      value: 'support@shoplane.com',
      desc: 'We respond within 24 hours'
    },
    {
      icon: MapPin,
      label: 'Warehouse',
      value: 'VeriDeal, 1234 Kakkanad, Kochi, Kerala, 123456',
      desc: 'Visit only by appointment'
    }
  ];

  const socials = [
    { icon: Facebook, url: 'https://www.facebook.com/', color: 'hover:text-blue-600', name: 'Facebook' },
    { icon: Instagram, url: 'https://www.instagram.com/', color: 'hover:text-pink-500', name: 'Instagram' },
    { icon: Twitter, url: 'https://x.com/?lang=en-in', color: 'hover:text-sky-500', name: 'Twitter' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Contact Us</h1>
       <p className="text-center text-gray-500 mb-10">We&rsquo;d love to hear from you!</p>


        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Send a Message</h2>

            {formStatus === 'error' && (
              <div className="flex items-start gap-3 text-red-600 bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-medium">Message Failed</p>
                  <p className="text-sm mt-1">{submitMessage}</p>
                </div>
              </div>
            )}
            {formStatus === 'success' && (
              <div className="flex items-start gap-3 text-green-600 bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
                <CheckCircle className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-medium">Message Sent!</p>
                  <p className="text-sm mt-1">{submitMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Your full name"
                  disabled={formStatus === 'loading'}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                  disabled={formStatus === 'loading'}
                />
                {errors.email && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none ${
                    errors.message ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Tell us how we can help you..."
                  disabled={formStatus === 'loading'}
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.message ? (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.message}
                    </p>
                  ) : (
                    <span className="text-sm text-gray-500">{formData.message.length}/500 characters</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={formStatus === 'loading'}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                {formStatus === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info and Social Links */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactDetails.map((info, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-3 rounded-xl">
                      <info.icon className="text-indigo-600 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-gray-800 font-medium">{info.label}</h3>
                      <p className="text-gray-600 font-medium">{info.value}</p>
                      <p className="text-sm text-gray-500 mt-1">{info.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Connect with Us</h2>
              <div className="flex justify-center gap-4 mb-4">
                {socials.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 ${social.color} hover:scale-110`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
              <p className="text-sm text-gray-500">Follow us for latest deals & offers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
