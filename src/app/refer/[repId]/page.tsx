'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRep, getCustomersByRep } from '@/lib/data';
import { Shield, User, Phone, Mail, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { Rep, Customer } from '@/types/database';

export default function ReferralSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const repId = params.repId as string;

  const [rep, setRep] = useState<Rep | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [repData, customersData] = await Promise.all([
          getRep(repId),
          getCustomersByRep(repId),
        ]);
        setRep(repData);
        setCustomers(customersData);
        
        // Auto-select first customer if only one
        if (customersData.length === 1) {
          setSelectedCustomerId(customersData[0].id);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load referral information');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [repId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validation
      if (!name.trim()) {
        throw new Error('Name is required');
      }
      if (!phone.trim() && !email.trim()) {
        throw new Error('Please provide a phone number or email');
      }

      // Use selected customer or first available
      const referrerId = selectedCustomerId || customers[0]?.id;

      // Submit via API for persistence
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrer_id: referrerId,
          referee_name: name.trim(),
          referee_phone: phone.trim() || null,
          referee_email: email.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit referral');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit referral');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-guardian-gold animate-spin" />
      </div>
    );
  }

  if (!rep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
          <p className="text-slate-400">This referral link is not valid or has expired.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Thank You!</h1>
          <p className="text-slate-400 mb-6">
            Your information has been submitted successfully. A representative from Guardian Storm Repair will contact you shortly to schedule your free inspection.
          </p>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <p className="text-sm text-slate-300">
              Referred by <span className="font-semibold text-white">{rep.name}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-guardian-navy mb-4">
            <Shield className="w-8 h-8 text-guardian-gold" />
          </div>
          <h1 className="text-2xl font-bold text-white">Guardian Storm Repair</h1>
          <p className="text-slate-400 mt-2">
            Referred by <span className="text-guardian-gold font-medium">{rep.name}</span>
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Get Your Free Inspection</h2>
            <p className="text-sm text-slate-400 mt-1">
              Submit your information and we&apos;ll contact you to schedule a free roof inspection and quote.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Your Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  required
                  disabled={submitting}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-guardian-gold focus:border-transparent disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  disabled={submitting}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-guardian-gold focus:border-transparent disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={submitting}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-guardian-gold focus:border-transparent disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-2">
                Additional Information (Optional)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="w-5 h-5 text-slate-500" />
                </div>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us about your roof damage or any special concerns..."
                  rows={3}
                  disabled={submitting}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-guardian-gold focus:border-transparent disabled:opacity-50 transition-all resize-none"
                />
              </div>
            </div>

            {/* Customer Selector - only show if multiple customers */}
            {customers.length > 1 && (
              <div>
                <label htmlFor="customer" className="block text-sm font-medium text-slate-300 mb-2">
                  Who referred you?
                </label>
                <select
                  id="customer"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  disabled={submitting}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-guardian-gold focus:border-transparent disabled:opacity-50 transition-all"
                >
                  <option value="">Select...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-lg bg-guardian-gold text-guardian-navy font-semibold hover:bg-guardian-gold/90 focus:outline-none focus:ring-2 focus:ring-guardian-gold focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Request Free Inspection'
              )}
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-4">
            By submitting, you agree to be contacted about storm repair services.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-8">
          Guardian Storm Repair &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
