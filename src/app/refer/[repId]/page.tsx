'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getRep, getCustomersByRep } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppointmentBooking, BookingPrompt } from '@/components/booking/AppointmentBooking';
import {
  Shield,
  User,
  Phone,
  Mail,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Gift,
  Calendar,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { Rep, Customer } from '@/types/database';

type Step = 1 | 2 | 3;

export default function ReferralSubmissionPage() {
  const params = useParams();
  const repId = params.repId as string;

  const [rep, setRep] = useState<Rep | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>(1);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [submittedReferrerName, setSubmittedReferrerName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [repData, customersData] = await Promise.all([
          getRep(repId),
          getCustomersByRep(repId),
        ]);
        setRep(repData);
        setCustomers(customersData);

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

  const fireConfetti = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#10B981', '#34D399'] });
    fire(0.2, { spread: 60, colors: ['#F97316', '#FBBF24'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#10B981', '#F97316'] });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#FBBF24', '#34D399'] });
    fire(0.1, { spread: 120, startVelocity: 45, colors: ['#F97316', '#10B981'] });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!name.trim()) throw new Error('Name is required');
      if (!phone.trim() && !email.trim()) throw new Error('Please provide a phone number or email');
      if (!agreedToTerms) throw new Error('Please agree to be contacted');

      const referrerId = selectedCustomerId || customers[0]?.id;

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
      if (!response.ok) throw new Error(data.error || 'Failed to submit referral');

      const referrer = customers.find((c) => c.id === referrerId);
      setSubmittedReferrerName(referrer?.name || rep?.name || 'a friend');
      setSubmitted(true);

      // Fire confetti!
      setTimeout(fireConfetti, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit referral');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedStep1 = name.trim().length > 0;
  const canProceedStep2 = phone.trim().length > 0 || email.trim().length > 0;
  const canSubmit = agreedToTerms;

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Success Message */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30"
            >
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Thank You, {name}!</h1>
            <p className="text-slate-400 mb-6">
              Your referral has been submitted successfully.
            </p>
          </div>

          {/* Referrer Info */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6">
            <p className="text-slate-300 text-center">
              Referred by{' '}
              <span className="font-semibold text-white">{submittedReferrerName}</span>
            </p>
            <p className="text-sm text-emerald-400 mt-2 flex items-center justify-center gap-1">
              <Gift className="w-4 h-4" />
              You&apos;ll earn $125 when your referral becomes a customer!
            </p>
          </div>

          {/* Book Appointment CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <BookingPrompt
              onBookClick={() => setShowBooking(true)}
              className="mb-4"
            />
          </motion.div>

          {/* Secondary Action */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm text-slate-500"
          >
            We&apos;ll also reach out to schedule if you prefer
          </motion.p>
        </motion.div>

        {/* Booking Modal */}
        <AppointmentBooking
          isOpen={showBooking}
          onClose={() => setShowBooking(false)}
          customerName={name}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-guardian-gold/20 to-guardian-gold/5 border border-guardian-gold/30 mb-4">
            <Shield className="w-8 h-8 text-guardian-gold" />
          </div>
          <h1 className="text-2xl font-bold text-white brand-wordmark">Guardian Storm Repair</h1>
          <p className="text-slate-400 mt-2">
            Referred by <span className="text-guardian-gold font-medium">{rep.name}</span>
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all step-number',
                  s === step
                    ? 'bg-guardian-gold text-slate-900'
                    : s < step
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                )}
              >
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={clsx(
                    'w-12 h-1 mx-1 rounded-full transition-all',
                    s < step ? 'bg-emerald-500' : 'bg-slate-800'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Your Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white">Your Information</h2>
                    <p className="text-sm text-slate-400 mt-1">Tell us about yourself</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">
                      Your Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Smith"
                        className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="w-full mt-6 bg-guardian-gold hover:bg-guardian-gold/90 text-slate-900 font-semibold"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Contact Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white">Contact Details</h2>
                    <p className="text-sm text-slate-400 mt-1">How can we reach you?</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-300">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 text-center">
                    Please provide at least one contact method
                  </p>

                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!canProceedStep2}
                      className="flex-1 bg-guardian-gold hover:bg-guardian-gold/90 text-slate-900 font-semibold"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review & Submit */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white">Almost Done!</h2>
                    <p className="text-sm text-slate-400 mt-1">Review and submit your referral</p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name</span>
                      <span className="text-white font-medium">{name}</span>
                    </div>
                    {phone && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phone</span>
                        <span className="text-white">{phone}</span>
                      </div>
                    )}
                    {email && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email</span>
                        <span className="text-white">{email}</span>
                      </div>
                    )}
                  </div>

                  {/* Optional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-300">
                      Additional Notes (Optional)
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tell us about your roof damage or concerns..."
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-guardian-gold focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  {/* Agreement Checkbox */}
                  <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-slate-600 bg-slate-800 text-guardian-gold focus:ring-guardian-gold focus:ring-offset-slate-900"
                    />
                    <span className="text-sm text-slate-300">
                      I agree to be contacted by Guardian Storm Repair about their services and scheduling a free inspection.
                    </span>
                  </label>

                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!canSubmit || submitting}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Referral
                          <CheckCircle className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-8">
          Guardian Storm Repair © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
