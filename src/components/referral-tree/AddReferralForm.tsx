'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { cn, formatPhoneNumber, isValidEmail, isValidPhone, generateId } from '@/lib/utils';
import { ReferralNodeData, ReferralStatus } from './ReferralNode';

interface AddReferralFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (referral: ReferralNodeData) => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

export default function AddReferralForm({ isOpen, onClose, onSubmit }: AddReferralFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (formData.email.trim() && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newReferral: ReferralNodeData = {
      id: generateId(),
      name: formData.name.trim(),
      phone: formData.phone,
      email: formData.email.trim() || undefined,
      status: 'submitted' as ReferralStatus,
      submittedAt: new Date(),
    };

    setIsSubmitting(false);
    setIsSuccess(true);

    // Show success state briefly then close
    setTimeout(() => {
      onSubmit(newReferral);
      handleClose();
    }, 1500);
  }, [formData, validateForm, onSubmit]);

  const handleClose = useCallback(() => {
    setFormData({ name: '', phone: '', email: '' });
    setErrors({});
    setIsSubmitting(false);
    setIsSuccess(false);
    onClose();
  }, [onClose]);

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-hidden"
          >
            <div className="bg-slate-900 border-t border-slate-700/50 rounded-t-3xl shadow-2xl">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Add Referral</h2>
                  <p className="text-sm text-slate-400">Earn $250 when they close!</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="px-6 pb-8 space-y-4">
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="py-12 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.1 }}
                        className="inline-flex items-center justify-center w-16 h-16 mb-4
                                   bg-emerald-500/20 rounded-full"
                      >
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Referral Submitted!
                      </h3>
                      <p className="text-sm text-slate-400">
                        We'll notify you when {formData.name.split(' ')[0]} moves forward.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {/* Name Input */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Their Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="John Smith"
                            className={cn(
                              'w-full pl-12 pr-4 py-3.5 bg-slate-800/80 border rounded-xl',
                              'text-white placeholder-slate-500',
                              'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
                              'transition-all duration-200',
                              errors.name
                                ? 'border-red-500/50 focus:ring-red-500/50'
                                : 'border-slate-700 hover:border-slate-600'
                            )}
                          />
                        </div>
                        {errors.name && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1.5 text-xs text-red-400"
                          >
                            {errors.name}
                          </motion.p>
                        )}
                      </div>

                      {/* Phone Input */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Their Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            placeholder="(215) 555-0123"
                            className={cn(
                              'w-full pl-12 pr-4 py-3.5 bg-slate-800/80 border rounded-xl',
                              'text-white placeholder-slate-500',
                              'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
                              'transition-all duration-200',
                              errors.phone
                                ? 'border-red-500/50 focus:ring-red-500/50'
                                : 'border-slate-700 hover:border-slate-600'
                            )}
                          />
                        </div>
                        {errors.phone && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1.5 text-xs text-red-400"
                          >
                            {errors.phone}
                          </motion.p>
                        )}
                      </div>

                      {/* Email Input (Optional) */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Their Email <span className="text-slate-500">(optional)</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="john@example.com"
                            className={cn(
                              'w-full pl-12 pr-4 py-3.5 bg-slate-800/80 border rounded-xl',
                              'text-white placeholder-slate-500',
                              'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
                              'transition-all duration-200',
                              errors.email
                                ? 'border-red-500/50 focus:ring-red-500/50'
                                : 'border-slate-700 hover:border-slate-600'
                            )}
                          />
                        </div>
                        {errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1.5 text-xs text-red-400"
                          >
                            {errors.email}
                          </motion.p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={cn(
                          'w-full py-4 mt-2 rounded-xl font-semibold text-white',
                          'flex items-center justify-center gap-2',
                          'transition-all duration-200',
                          isSubmitting
                            ? 'bg-slate-700 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/30'
                        )}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Submit Referral
                          </>
                        )}
                      </motion.button>

                      {/* Terms Note */}
                      <p className="text-center text-xs text-slate-500 pt-2">
                        By submitting, you confirm you have permission to share this contact.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Safe area for iOS */}
              <div className="h-safe-area-inset-bottom bg-slate-900" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
