'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ArrowRight,
  Smartphone,
  Users,
  DollarSign,
  Sparkles,
  Zap,
  Bell,
  CheckCircle2,
  Star,
  TrendingUp,
  X,
} from 'lucide-react';
import Link from 'next/link';
import CustomerHeader from '@/components/ui/CustomerHeader';
import {
  AnimatedText,
  AnimatedCounter,
  GradientMesh,
  ScrollReveal,
  BentoCard,
  FloatingElement,
  GlowButton,
  TrustBadge,
  AnimatedIcon,
  StepConnector,
} from '@/components/ui/landing-animations';

export default function DemoPage() {
  const [showQRSimulation, setShowQRSimulation] = useState(false);

  return (
    <div className="min-h-screen bg-[#050508] overflow-x-hidden">
      <CustomerHeader />

      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Animated Gradient Mesh Background */}
        <GradientMesh className="opacity-60" />
        
        {/* Floating decorative elements */}
        <FloatingElement
          className="absolute top-32 left-[10%] hidden lg:block"
          speed={0.5}
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center backdrop-blur-sm">
            <Shield className="w-8 h-8 text-amber-500/60" />
          </div>
        </FloatingElement>
        
        <FloatingElement
          className="absolute top-48 right-[15%] hidden lg:block"
          speed={0.7}
          direction="down"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
            <DollarSign className="w-6 h-6 text-emerald-500/60" />
          </div>
        </FloatingElement>
        
        <FloatingElement
          className="absolute bottom-32 left-[20%] hidden lg:block"
          speed={0.4}
        >
          <div className="w-14 h-14 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center backdrop-blur-sm">
            <Users className="w-7 h-7 text-sky-500/60" />
          </div>
        </FloatingElement>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          {/* Trust Badge */}
          <TrustBadge className="mb-8">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Trusted by 500+ Storm Repair Contractors</span>
          </TrustBadge>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-4 mb-10"
          >
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30">
                <Shield className="w-9 h-9 md:w-11 md:h-11 text-white" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-xl"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Guardianship
              </h1>
              <p className="text-sm md:text-base text-slate-400">Referral Program</p>
            </div>
          </motion.div>

          {/* Headline with animated text */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            <AnimatedText
              text="Turn Happy Customers Into"
              delay={0.3}
              staggerDelay={0.03}
              className="justify-center"
            />
            <span className="block mt-2 md:mt-4">
              <AnimatedText
                text="Your Sales Team"
                delay={0.8}
                staggerDelay={0.04}
                className="justify-center bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent"
              />
            </span>
          </h2>

          {/* Subheadline */}
          <ScrollReveal delay={0.4} className="max-w-2xl mx-auto mb-10">
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
              Gamified referral tracking that replaces paper cards. Customers see their
              referral tree grow, track earnings in real-time, and get notified when
              referrals convert.
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={0.6} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/referrals/demo-customer">
              <GlowButton variant="gold" className="w-full sm:w-auto">
                <Smartphone className="w-5 h-5" />
                <span>View Customer Experience</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </GlowButton>
            </Link>
            <motion.button
              onClick={() => setShowQRSimulation(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-4
                         bg-slate-800/80 hover:bg-slate-700/80
                         text-white font-semibold rounded-xl 
                         border border-slate-700 hover:border-slate-600
                         backdrop-blur-sm
                         transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-5 h-5" />
              Simulate QR Scan
            </motion.button>
          </ScrollReveal>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-slate-400"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* BENTO GRID FEATURES SECTION */}
      {/* ================================================================== */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to
              <span className="text-amber-400"> Grow Referrals</span>
            </h3>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A complete referral management system designed for storm repair professionals
            </p>
          </ScrollReveal>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[180px] md:auto-rows-[200px]">
            {/* Large Card - Visual Referral Tree */}
            <BentoCard size="large" color="gold" delay={0.1}>
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-white">Visual Referral Tree</h4>
                </div>
                <p className="text-slate-400 mb-6 flex-grow">
                  Watch your network grow with an interactive tree visualization. 
                  Each node shows referral status with color-coded progress.
                </p>
                {/* Mini tree illustration */}
                <div className="relative h-24 md:h-32">
                  <svg viewBox="0 0 300 100" className="w-full h-full opacity-70">
                    {/* Root node */}
                    <circle cx="150" cy="20" r="12" fill="#D4A656" />
                    {/* Level 1 */}
                    <line x1="150" y1="32" x2="80" y2="55" stroke="#475569" strokeWidth="2" />
                    <line x1="150" y1="32" x2="150" y2="55" stroke="#475569" strokeWidth="2" />
                    <line x1="150" y1="32" x2="220" y2="55" stroke="#475569" strokeWidth="2" />
                    <circle cx="80" cy="60" r="10" fill="#10b981" />
                    <circle cx="150" cy="60" r="10" fill="#0ea5e9" />
                    <circle cx="220" cy="60" r="10" fill="#f59e0b" />
                    {/* Level 2 */}
                    <line x1="80" y1="70" x2="50" y2="90" stroke="#475569" strokeWidth="2" />
                    <line x1="80" y1="70" x2="110" y2="90" stroke="#475569" strokeWidth="2" />
                    <motion.circle
                      cx="50" cy="95" r="8" fill="#64748b"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                    <motion.circle
                      cx="110" cy="95" r="8" fill="#10b981"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    />
                  </svg>
                </div>
              </div>
            </BentoCard>

            {/* Medium Card - Earnings Tracker */}
            <BentoCard size="medium" color="emerald" delay={0.2}>
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-white">Earnings Tracker</h4>
                </div>
                <p className="text-slate-400 mb-4">
                  Real-time running total of earnings with animated counter.
                </p>
                <div className="mt-auto">
                  <div className="text-4xl md:text-5xl font-bold text-emerald-400">
                    $<AnimatedCounter value={1250} duration={2} />
                  </div>
                  <p className="text-sm text-slate-500 mt-1">5 referrals × $250 each</p>
                </div>
              </div>
            </BentoCard>

            {/* Small Card - Mobile PWA */}
            <BentoCard size="small" color="sky" delay={0.3}>
              <div className="flex items-center gap-4 h-full">
                <AnimatedIcon animation="float">
                  <div className="w-14 h-14 rounded-xl bg-sky-500/20 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-7 h-7 text-sky-400" />
                  </div>
                </AnimatedIcon>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Mobile PWA</h4>
                  <p className="text-sm text-slate-400">
                    Works offline, installs like an app
                  </p>
                </div>
              </div>
            </BentoCard>

            {/* Wide Card - Status Flow */}
            <BentoCard size="wide" color="purple" delay={0.4}>
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Status Flow Tracking</h4>
                </div>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  {[
                    { label: 'Submitted', color: 'bg-slate-500' },
                    { label: 'Contacted', color: 'bg-sky-500' },
                    { label: 'Quoted', color: 'bg-amber-500' },
                    { label: 'Sold', color: 'bg-emerald-500' },
                  ].map((status, i) => (
                    <div key={status.label} className="flex items-center gap-2 flex-1">
                      <motion.div
                        className={`w-3 h-3 rounded-full ${status.color}`}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                      />
                      <span className="text-xs md:text-sm text-slate-400 truncate">{status.label}</span>
                      {i < 3 && (
                        <ArrowRight className="w-3 h-3 text-slate-600 hidden md:block flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>

            {/* Small Card - Notifications */}
            <BentoCard size="small" color="gold" delay={0.5}>
              <div className="flex items-center gap-4 h-full">
                <AnimatedIcon animation="pulse">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 relative">
                    <Bell className="w-7 h-7 text-amber-400" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                      3
                    </span>
                  </div>
                </AnimatedIcon>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">Instant Alerts</h4>
                  <p className="text-sm text-slate-400">
                    Get notified on every update
                  </p>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* STATS / SOCIAL PROOF SECTION */}
      {/* ================================================================== */}
      <section className="relative py-20 md:py-28">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent" />
        
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: 500, suffix: '+', label: 'Referrals Tracked', delay: 0 },
              { value: 125, prefix: '$', suffix: 'K+', label: 'Paid to Customers', delay: 0.1 },
              { value: 98, suffix: '%', label: 'Satisfaction Rate', delay: 0.2 },
              { value: 24, suffix: '/7', label: 'Access Anytime', delay: 0.3 },
            ].map((stat) => (
              <ScrollReveal key={stat.label} delay={stat.delay} className="text-center">
                <div className="text-3xl md:text-5xl font-bold text-white mb-2">
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    delay={stat.delay}
                  />
                </div>
                <p className="text-sm md:text-base text-slate-400">{stat.label}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* HOW IT WORKS SECTION */}
      {/* ================================================================== */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h3>
            <p className="text-slate-400 text-lg">
              From QR scan to cash in hand — it&apos;s that simple
            </p>
          </ScrollReveal>

          {/* Steps */}
          <div className="relative">
            {/* Connecting line - desktop only */}
            <div className="hidden md:block absolute top-[60px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-px">
              <StepConnector orientation="horizontal" />
            </div>

            <div className="grid md:grid-cols-4 gap-8 md:gap-6">
              {[
                {
                  step: 1,
                  icon: Zap,
                  title: 'Rep Shares QR Code',
                  description: 'After completing a successful job, scan or share your unique QR code',
                },
                {
                  step: 2,
                  icon: Users,
                  title: 'Customer Submits Referral',
                  description: 'They fill out a simple form with their friend\'s contact info',
                },
                {
                  step: 3,
                  icon: TrendingUp,
                  title: 'Track Progress Live',
                  description: 'Watch referrals move through the pipeline in real-time',
                },
                {
                  step: 4,
                  icon: DollarSign,
                  title: 'Earn $250 Per Close',
                  description: 'Get notified and paid when your referral becomes a customer',
                },
              ].map((item, i) => (
                <ScrollReveal key={item.step} delay={i * 0.15}>
                  <div className="relative text-center group">
                    {/* Step number with icon */}
                    <motion.div
                      className="relative w-20 h-20 mx-auto mb-6"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 group-hover:border-amber-500/40 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <item.icon className="w-8 h-8 text-amber-400" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-amber-400">{item.step}</span>
                      </div>
                    </motion.div>

                    {/* Content */}
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* TESTIMONIAL SECTION */}
      {/* ================================================================== */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
              {/* Quote marks */}
              <div className="absolute top-6 left-8 text-6xl text-amber-500/20 font-serif">&ldquo;</div>
              
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <blockquote className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-8">
                This system has completely transformed how we handle referrals. 
                Our customers love seeing their tree grow, and we&apos;ve seen a 
                40% increase in referral submissions since switching from paper cards.
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">MJ</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Mike Johnson</div>
                  <div className="text-sm text-slate-400">Owner, Johnson Storm Repair</div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CTA SECTION */}
      {/* ================================================================== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,166,86,0.15),transparent_70%)]" />
        
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
              <CheckCircle2 className="w-4 h-4" />
              No credit card required
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Start Earning <span className="text-amber-400">$250</span> Per Referral
            </h3>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Join hundreds of storm repair professionals who&apos;ve upgraded 
              from paper referral cards to our digital tracking system.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/referrals/demo-customer">
              <GlowButton variant="gold" className="w-full sm:w-auto text-lg px-8 py-5">
                <span>Try the Demo</span>
                <ArrowRight className="w-5 h-5" />
              </GlowButton>
            </Link>
            <Link href="/login">
              <motion.button
                className="inline-flex items-center justify-center gap-2 px-8 py-5
                           bg-transparent hover:bg-slate-800/50
                           text-white font-semibold rounded-xl 
                           border border-slate-600 hover:border-slate-500
                           transition-all duration-300 w-full sm:w-auto text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign In
              </motion.button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FOOTER */}
      {/* ================================================================== */}
      <footer className="relative py-12 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Guardianship</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/demo" className="hover:text-white transition-colors">Home</Link>
              <Link href="/referrals/demo-customer" className="hover:text-white transition-colors">Demo</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            </div>

            {/* Copyright */}
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Guardian Storm Repair
            </p>
          </div>
        </div>
      </footer>

      {/* ================================================================== */}
      {/* QR SIMULATION MODAL */}
      {/* ================================================================== */}
      <AnimatePresence>
        {showQRSimulation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRSimulation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowQRSimulation(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-48 h-48 bg-white rounded-2xl mx-auto mb-6 p-4 shadow-xl">
                {/* QR code pattern */}
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center p-2">
                  <div className="grid grid-cols-7 gap-1 w-full h-full">
                    {[...Array(49)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.01 }}
                        className={`rounded-sm ${
                          // Create a more realistic QR pattern
                          (i < 3 || (i >= 4 && i < 7) || i === 7 || i === 13 || 
                           i === 14 || i === 20 || i === 21 || i === 27 ||
                           i === 28 || i === 34 || i === 35 || i === 41 ||
                           (i >= 42 && i < 45) || (i >= 46 && i < 49))
                            ? 'bg-white'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <h4 className="text-xl font-semibold text-white mb-2">
                Scan to Submit Referral
              </h4>
              <p className="text-sm text-slate-400 mb-6">
                This QR code links directly to your referral submission form
              </p>

              <Link href="/referrals/demo-customer">
                <GlowButton variant="gold" className="w-full">
                  Simulate Scan
                  <ArrowRight className="w-4 h-4" />
                </GlowButton>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
