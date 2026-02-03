'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { cn, formatPhoneNumber, isValidEmail, isValidPhone, generateId } from '@/lib/utils';
import { ReferralNodeData, ReferralStatus } from './ReferralNode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MobileSheet,
  MobileSheetContent,
  MobileSheetHeader,
  MobileSheetTitle,
  MobileSheetDescription,
  MobileSheetBody,
} from '@/components/ui/mobile-sheet';

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
    <MobileSheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <MobileSheetContent maxHeight="lg" showHandle>
        {/* Header */}
        <MobileSheetHeader onClose={handleClose}>
          <MobileSheetTitle>Add Referral</MobileSheetTitle>
          <MobileSheetDescription>Earn $125 when they close!</MobileSheetDescription>
        </MobileSheetHeader>

        {/* Body */}
        <MobileSheetBody>
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
                  className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-emerald-500/20 rounded-full"
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
                className="space-y-5"
              >
                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="ref-name" className="text-slate-300">
                    Their Name <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <Input
                      id="ref-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Smith"
                      aria-invalid={!!errors.name}
                      className={cn(
                        'pl-12 py-3.5 h-auto rounded-xl',
                        'bg-slate-800/80 border-slate-700',
                        'text-white placeholder-slate-500',
                        'focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50',
                        errors.name && 'border-red-500/50 focus-visible:ring-red-500/50'
                      )}
                    />
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                  <Label htmlFor="ref-phone" className="text-slate-300">
                    Their Phone Number <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <Input
                      id="ref-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(215) 555-0123"
                      aria-invalid={!!errors.phone}
                      className={cn(
                        'pl-12 py-3.5 h-auto rounded-xl',
                        'bg-slate-800/80 border-slate-700',
                        'text-white placeholder-slate-500',
                        'focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50',
                        errors.phone && 'border-red-500/50 focus-visible:ring-red-500/50'
                      )}
                    />
                  </div>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400"
                    >
                      {errors.phone}
                    </motion.p>
                  )}
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="ref-email" className="text-slate-300">
                    Their Email <span className="text-slate-500">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                    <Input
                      id="ref-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john@example.com"
                      aria-invalid={!!errors.email}
                      className={cn(
                        'pl-12 py-3.5 h-auto rounded-xl',
                        'bg-slate-800/80 border-slate-700',
                        'text-white placeholder-slate-500',
                        'focus-visible:ring-amber-500/50 focus-visible:border-amber-500/50',
                        errors.email && 'border-red-500/50 focus-visible:ring-red-500/50'
                      )}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  variant="gold"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 mt-4 rounded-xl font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Referral
                    </>
                  )}
                </Button>

                {/* Terms Note */}
                <p className="text-center text-xs text-slate-500 pt-2">
                  By submitting, you confirm you have permission to share this contact.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </MobileSheetBody>
      </MobileSheetContent>
    </MobileSheet>
  );
}
