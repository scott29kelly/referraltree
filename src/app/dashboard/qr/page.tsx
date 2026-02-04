'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { QrCode, Copy, Download, Check, ExternalLink } from 'lucide-react';
import { getReferralUrl } from '@/lib/utils';

// Simple QR Code generator using Canvas API
function generateQRCode(text: string, size: number = 200): string {
  // This is a simple QR code generator - in production, use a library like qrcode
  // For now, we'll use a placeholder and an external API
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=1e3a5f&color=d4a656`;
}

export default function QRCodePage() {
  const { rep, isLoading } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const downloadRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (rep) {
      // Generate referral link using centralized utility for production-safe URLs
      setReferralLink(getReferralUrl(rep.id));
    }
  }, [rep]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = async () => {
    try {
      const qrUrl = generateQRCode(referralLink, 400);
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (downloadRef.current) {
        downloadRef.current.href = url;
        downloadRef.current.download = `guardian-qr-${rep?.name?.replace(/\s+/g, '-').toLowerCase() || 'code'}.png`;
        downloadRef.current.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to download:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-48 animate-pulse" />
        <div className="h-96 bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Your QR Code</h1>
        <p className="text-slate-400 mt-1">
          Share this code with customers to track their referrals
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <div className="rounded-2xl bg-guardian-navy border border-guardian-gold/20 p-6 lg:p-8 flex flex-col items-center">
          <div className="w-full max-w-xs">
            <div className="bg-white rounded-xl p-4 mb-6">
              {referralLink ? (
                <img
                  src={generateQRCode(referralLink, 300)}
                  alt="Your referral QR code"
                  className="w-full h-auto"
                />
              ) : (
                <div className="aspect-square bg-slate-200 rounded flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-slate-400" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-guardian-gold text-guardian-navy font-semibold hover:bg-guardian-gold/90 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Link
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-all"
              >
                <Download className="w-5 h-5" />
                Download QR Code
              </button>
              <a ref={downloadRef} className="hidden" />
            </div>
          </div>
        </div>

        {/* Link & Preview */}
        <div className="space-y-6">
          {/* Link Display */}
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Your Referral Link
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden">
                <p className="text-sm text-slate-300 truncate font-mono">
                  {referralLink || 'Loading...'}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="p-3 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Preview Card */}
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Customer Preview
              </h3>
              <a
                href={referralLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-guardian-gold hover:underline"
              >
                Open <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              This is what customers will see when they scan your QR code:
            </p>

            {/* Mini Preview - Clickable */}
            <a
              href={referralLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-slate-900 border border-slate-700 overflow-hidden hover:border-guardian-gold/50 transition-all"
            >
              <div className="p-4 border-b border-slate-700 bg-guardian-navy">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-guardian-gold/20 flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-guardian-gold" />
                  </div>
                  <span className="font-semibold text-white">Guardianship</span>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-white mb-1">
                  Referred by {rep?.name}
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                  Submit your information for a free inspection and quote
                </p>
                <div className="space-y-2">
                  <div className="h-8 bg-slate-800 rounded flex items-center px-3">
                    <span className="text-xs text-slate-500">Your Name *</span>
                  </div>
                  <div className="h-8 bg-slate-800 rounded flex items-center px-3">
                    <span className="text-xs text-slate-500">Phone Number</span>
                  </div>
                  <div className="h-8 bg-slate-800 rounded flex items-center px-3">
                    <span className="text-xs text-slate-500">Email Address</span>
                  </div>
                  <div className="h-10 bg-guardian-gold rounded flex items-center justify-center">
                    <span className="text-sm font-semibold text-guardian-navy">Request Free Inspection</span>
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* Instructions */}
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              How to Use
            </h3>
            <ol className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-guardian-gold/20 text-guardian-gold flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  1
                </span>
                <span>Download the QR code or copy the link</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-guardian-gold/20 text-guardian-gold flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  2
                </span>
                <span>Share with customers who need storm repair services</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-guardian-gold/20 text-guardian-gold flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  3
                </span>
                <span>When they submit, you&apos;ll see the referral in your dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-guardian-gold/20 text-guardian-gold flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  4
                </span>
                <span>Earn $125 for every referral that closes!</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
