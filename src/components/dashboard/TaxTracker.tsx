'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Info,
  FileText,
  DollarSign,
  CheckCircle,
  X,
  HelpCircle,
  User,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tax threshold constants
const TAX_THRESHOLD = 599;
const WARNING_THRESHOLD = 500; // Start showing warning at $500

export interface TaxTrackerProps {
  yearlyEarnings: number;
  year?: number;
  hasProvidedTaxInfo?: boolean;
  onProvideTaxInfo?: () => void;
  className?: string;
}

export function TaxTracker({
  yearlyEarnings,
  year = new Date().getFullYear(),
  hasProvidedTaxInfo = false,
  onProvideTaxInfo,
  className,
}: TaxTrackerProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const isOverThreshold = yearlyEarnings >= TAX_THRESHOLD;
  const isApproachingThreshold = yearlyEarnings >= WARNING_THRESHOLD && yearlyEarnings < TAX_THRESHOLD;
  const remainingBeforeThreshold = Math.max(0, TAX_THRESHOLD - yearlyEarnings);
  const percentToThreshold = Math.min((yearlyEarnings / TAX_THRESHOLD) * 100, 100);

  // Determine display state
  const needsTaxInfo = isOverThreshold && !hasProvidedTaxInfo;

  return (
    <div className={className}>
      {/* Main Tax Tracker Card */}
      <div
        className={cn(
          'rounded-xl border p-4',
          isOverThreshold
            ? needsTaxInfo
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-emerald-500/10 border-emerald-500/30'
            : isApproachingThreshold
            ? 'bg-guardian-gold/5 border-guardian-gold/20'
            : 'bg-slate-800/50 border-slate-700/50'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText
              className={cn(
                'w-5 h-5',
                isOverThreshold
                  ? needsTaxInfo
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                  : 'text-slate-400'
              )}
            />
            <span className="font-medium text-white text-sm">
              {year} Referral Earnings
            </span>
          </div>
          <button
            className="p-1 text-slate-400 hover:text-white transition-colors relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Info Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute right-4 top-12 z-10 w-64 p-3 rounded-lg bg-slate-900 border border-slate-700 shadow-xl"
            >
              <h4 className="font-semibold text-white text-sm mb-2">1099 Requirements</h4>
              <p className="text-xs text-slate-400 mb-2">
                If you earn ${TAX_THRESHOLD} or more in referral bonuses this year, Guardian Storm Repair
                is required to issue you a 1099-NEC form for tax purposes.
              </p>
              <p className="text-xs text-slate-400">
                We&apos;ll need your full legal name and address. SSN is optional - if not provided,
                24% will be withheld for taxes.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Earnings Display */}
        <div className="flex items-baseline gap-1 mb-3">
          <DollarSign
            className={cn(
              'w-6 h-6',
              isOverThreshold
                ? needsTaxInfo
                  ? 'text-amber-400'
                  : 'text-emerald-400'
                : 'text-guardian-gold'
            )}
          />
          <span
            className={cn(
              'text-3xl font-bold',
              isOverThreshold
                ? needsTaxInfo
                  ? 'text-amber-400'
                  : 'text-emerald-400'
                : 'text-white'
            )}
          >
            {yearlyEarnings.toLocaleString()}
          </span>
          <span className="text-sm text-slate-500 ml-1">this year</span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>1099 Threshold</span>
            <span>${TAX_THRESHOLD}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentToThreshold}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                isOverThreshold
                  ? needsTaxInfo
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-guardian-gold to-amber-400'
              )}
            />
          </div>
        </div>

        {/* Status Message */}
        {isOverThreshold ? (
          needsTaxInfo ? (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-400">Tax Information Required</p>
                <p className="text-xs text-slate-400 mt-1">
                  You&apos;ve exceeded the 1099 threshold. Please provide your information for tax
                  reporting.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 text-amber-900 text-sm font-semibold hover:bg-amber-400 transition-colors"
                >
                  Provide Tax Info
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>Tax information on file - 1099 will be sent by January 31</span>
            </div>
          )
        ) : isApproachingThreshold ? (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-guardian-gold/10 border border-guardian-gold/20">
            <Info className="w-5 h-5 text-guardian-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-guardian-gold">Approaching 1099 Threshold</p>
              <p className="text-xs text-slate-400 mt-1">
                ${remainingBeforeThreshold.toLocaleString()} more to reach the threshold. We&apos;ll
                ask for your tax info when you exceed ${TAX_THRESHOLD}.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            ${remainingBeforeThreshold.toLocaleString()} more before 1099 reporting required
          </p>
        )}
      </div>

      {/* Tax Info Form Modal */}
      <AnimatePresence>
        {showForm && (
          <TaxInfoForm
            onClose={() => setShowForm(false)}
            onSubmit={() => {
              setShowForm(false);
              onProvideTaxInfo?.();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TaxInfoForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [ssn, setSsn] = useState('');
  const [withhold, setWithhold] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = fullName && address && city && state && zip;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));

    // In production, this would save to the database
    console.log('[TAX INFO] Submitted:', {
      fullName,
      address,
      city,
      state,
      zip,
      ssn: ssn ? '***-**-' + ssn.slice(-4) : null,
      withhold: !ssn || withhold,
    });

    setSubmitting(false);
    onSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-guardian-gold" />
            Tax Information
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-6">
          This information is required for 1099-NEC reporting. Your data is securely stored and
          only used for tax purposes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Legal Name */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Full Legal Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John A. Smith"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-guardian-gold/50"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Street Address *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-guardian-gold/50"
                required
              />
            </div>
          </div>

          {/* City, State, Zip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-sm text-slate-300 mb-1">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-guardian-gold/50"
                required
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm text-slate-300 mb-1">State *</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                placeholder="PA"
                maxLength={2}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-guardian-gold/50"
                required
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm text-slate-300 mb-1">ZIP *</label>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="12345"
                maxLength={5}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-guardian-gold/50"
                required
              />
            </div>
          </div>

          {/* SSN (Optional) */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              SSN <span className="text-slate-500">(Optional)</span>
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={ssn}
                onChange={(e) => setSsn(e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="XXX-XX-XXXX"
                maxLength={9}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-guardian-gold/50"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              If not provided, 24% will be withheld for federal taxes.
            </p>
          </div>

          {/* Withholding Option */}
          {!ssn && (
            <label className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 cursor-pointer">
              <input
                type="checkbox"
                checked={withhold}
                onChange={(e) => setWithhold(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-guardian-gold focus:ring-guardian-gold"
              />
              <span className="text-sm text-slate-300">
                I understand 24% backup withholding will apply without SSN
              </span>
            </label>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className={cn(
              'w-full py-3 rounded-xl font-semibold transition-all',
              canSubmit
                ? 'bg-guardian-gold text-guardian-navy hover:bg-guardian-gold/90'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            )}
          >
            {submitting ? 'Saving...' : 'Save Tax Information'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Compact inline banner for warning
export function TaxWarningBanner({
  yearlyEarnings,
  onDismiss,
}: {
  yearlyEarnings: number;
  onDismiss: () => void;
}) {
  if (yearlyEarnings < WARNING_THRESHOLD || yearlyEarnings >= TAX_THRESHOLD) {
    return null;
  }

  const remainingBeforeThreshold = TAX_THRESHOLD - yearlyEarnings;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between gap-4 p-3 rounded-lg bg-guardian-gold/10 border border-guardian-gold/20"
    >
      <div className="flex items-center gap-3">
        <Info className="w-5 h-5 text-guardian-gold flex-shrink-0" />
        <p className="text-sm text-slate-300">
          <span className="font-medium text-guardian-gold">
            ${remainingBeforeThreshold}
          </span>{' '}
          more earnings before 1099 tax reporting kicks in
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default TaxTracker;
