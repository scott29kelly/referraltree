'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, Users, DollarSign, Sparkles } from 'lucide-react';
import Link from 'next/link';
import CustomerHeader from '@/components/ui/CustomerHeader';
import { GuardianLogo } from '@/components/ui/guardian-logo';

export default function DemoPage() {
  const [showQRSimulation, setShowQRSimulation] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-guardian-navy/30 to-slate-950">
      <CustomerHeader />

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-guardian-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="inline-block mb-8"
          >
            <GuardianLogo size="lg" variant="gold" showText />
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Turn Happy Customers Into
            <span className="block mt-2 bg-gradient-to-r from-guardian-gold to-guardian-orange bg-clip-text text-transparent">
              Your Sales Team
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-8"
          >
            Gamified referral tracking that replaces paper cards. Customers see their
            referral tree grow, track earnings in real-time, and get notified when
            referrals convert.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/referrals/demo-customer"
              className="group inline-flex items-center gap-2 px-6 py-4
                         bg-gradient-to-r from-guardian-gold to-guardian-orange
                         hover:from-guardian-gold/90 hover:to-guardian-orange/90
                         text-guardian-navy font-semibold rounded-xl shadow-lg shadow-guardian-gold/30
                         transition-all duration-300"
            >
              <Smartphone className="w-5 h-5" />
              View Customer Experience
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => setShowQRSimulation(true)}
              className="inline-flex items-center gap-2 px-6 py-4
                         bg-guardian-navy hover:bg-guardian-blue
                         text-white font-semibold rounded-xl border border-guardian-blue/30
                         transition-all duration-300"
            >
              <Users className="w-5 h-5" />
              Simulate QR Scan
            </button>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <FeatureCard
            icon={Users}
            title="Visual Referral Tree"
            description="Customers see their network grow with animated nodes showing each referral's status"
            color="gold"
            delay={0.6}
          />
          <FeatureCard
            icon={DollarSign}
            title="Earnings Tracker"
            description="Real-time running total of $125 per closed referral with animated counter"
            color="emerald"
            delay={0.7}
          />
          <FeatureCard
            icon={Sparkles}
            title="Status Updates"
            description="Color-coded progress from Submitted to Contacted to Quoted to Closed"
            color="sky"
            delay={0.8}
          />
        </motion.div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-2xl font-bold text-white text-center mb-12"
        >
          How It Works
        </motion.h3>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: 1, title: 'Sales rep shares QR', desc: 'After a successful job' },
            { step: 2, title: 'Customer submits referral', desc: 'Name, phone, email' },
            { step: 3, title: 'Tree grows automatically', desc: 'Visual status tracking' },
            { step: 4, title: 'Earn $125 per close', desc: 'Automatic notification' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="relative"
            >
              <div className="text-center p-4 bg-guardian-navy/30 rounded-xl border border-guardian-gold/20">
                <div className="w-10 h-10 rounded-full bg-guardian-gold/20 text-guardian-gold
                              font-bold text-lg flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-guardian-gold/30" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* QR Simulation Modal */}
      {showQRSimulation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowQRSimulation(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-guardian-navy border border-guardian-gold/20 rounded-2xl p-6 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-48 h-48 bg-white rounded-xl mx-auto mb-4 p-3">
              {/* Placeholder QR code pattern */}
              <div className="w-full h-full bg-guardian-navy rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-5 gap-1">
                  {[...Array(25)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-sm ${
                        Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <h4 className="font-semibold text-white mb-2">Scan to Submit Referral</h4>
            <p className="text-sm text-slate-400 mb-4">
              This QR code would link directly to the customer's referral submission form
            </p>
            <Link
              href="/refer/b2c3d4e5-f6a7-8901-bcde-f12345678901"
              className="inline-flex items-center gap-2 px-4 py-2 bg-guardian-gold hover:bg-guardian-gold/90
                         text-guardian-navy font-medium rounded-lg transition-colors"
            >
              Simulate Scan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  delay,
}: {
  icon: any;
  title: string;
  description: string;
  color: 'gold' | 'emerald' | 'sky';
  delay: number;
}) {
  const colorClasses = {
    gold: 'bg-guardian-gold/10 border-guardian-gold/30 text-guardian-gold',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    sky: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-6 rounded-xl border ${colorClasses[color]}`}
    >
      <Icon className="w-8 h-8 mb-4" />
      <h4 className="font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-400">{description}</p>
    </motion.div>
  );
}