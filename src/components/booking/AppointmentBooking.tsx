'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle,
  X,
  ArrowRight,
  CalendarCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentBookingProps {
  /** Whether the booking modal is open */
  isOpen: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
  /** Name of the person booking (for personalization) */
  customerName?: string;
  /** Optional callback when booking is initiated */
  onBookingInitiated?: () => void;
}

// Get booking URL from environment or use placeholder
const getBookingUrl = () => {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GOOGLE_CALENDAR_BOOKING_URL) {
    return process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_BOOKING_URL;
  }
  // Placeholder URL - in production, this would be Guardian's actual booking link
  return 'https://calendar.google.com/calendar/appointments';
};

export function AppointmentBooking({
  isOpen,
  onClose,
  customerName,
  onBookingInitiated,
}: AppointmentBookingProps) {
  const [hasClicked, setHasClicked] = useState(false);
  const bookingUrl = getBookingUrl();

  const handleBookClick = () => {
    setHasClicked(true);
    onBookingInitiated?.();
    // Open booking link in new tab
    window.open(bookingUrl, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setHasClicked(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-gradient-to-br from-guardian-navy to-slate-900 border border-guardian-gold/20 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!hasClicked ? (
              <>
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl bg-guardian-gold/20 border border-guardian-gold/30 flex items-center justify-center"
                  >
                    <Calendar className="w-8 h-8 text-guardian-gold" />
                  </motion.div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-white text-center mb-2">
                  Schedule Your Free Inspection
                </h2>
                <p className="text-slate-400 text-center mb-6">
                  {customerName
                    ? `Thanks ${customerName}! Want to schedule your free roof inspection now?`
                    : 'Want to schedule your free roof inspection now?'}
                </p>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  <BenefitItem icon={Clock} text="Quick 15-30 minute inspection" />
                  <BenefitItem icon={CheckCircle} text="100% free, no obligations" />
                  <BenefitItem icon={CalendarCheck} text="Choose a time that works for you" />
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBookClick}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4
                               bg-gradient-to-r from-guardian-gold to-guardian-orange
                               hover:from-guardian-gold/90 hover:to-guardian-orange/90
                               text-guardian-navy font-semibold rounded-xl shadow-lg shadow-guardian-gold/30
                               transition-all"
                  >
                    <Calendar className="w-5 h-5" />
                    Book Appointment Now
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>

                  <button
                    onClick={handleClose}
                    className="w-full px-6 py-3 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Success state after clicking */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Booking Page Opened
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Complete your booking in the new tab. We&apos;ll see you soon!
                  </p>

                  <div className="space-y-3">
                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-guardian-gold hover:underline text-sm"
                    >
                      Didn&apos;t open? Click here
                      <ArrowRight className="w-4 h-4" />
                    </a>

                    <button
                      onClick={handleClose}
                      className="block w-full px-6 py-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BenefitItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
      <Icon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      <span className="text-sm text-slate-300">{text}</span>
    </div>
  );
}

// Inline booking prompt component for embedding in other components
export function BookingPrompt({
  onBookClick,
  className,
}: {
  onBookClick: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl bg-gradient-to-r from-guardian-gold/10 to-guardian-orange/10 border border-guardian-gold/20',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-guardian-gold/20 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-guardian-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm mb-1">
            Schedule Your Free Inspection
          </h4>
          <p className="text-xs text-slate-400 mb-3">
            Book a time now while you&apos;re here. It only takes a minute!
          </p>
          <button
            onClick={onBookClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-guardian-gold text-guardian-navy text-sm font-semibold
                       hover:bg-guardian-gold/90 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Book Now
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppointmentBooking;
