'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  QrCode,
  Copy,
  Check,
  Share2,
  Download,
  Link as LinkIcon,
  MessageSquare,
  Mail,
} from 'lucide-react';
import { clsx } from 'clsx';
import { getReferralUrl } from '@/lib/utils';

interface QRCodeSheetProps {
  repId: string;
  repName: string;
  children?: React.ReactNode;
  className?: string;
}

export function QRCodeSheet({ repId, repName, children, className }: QRCodeSheetProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  // Use centralized URL utility for production-safe referral links
  const referralUrl = getReferralUrl(repId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Guardian Storm Repair Referral',
          text: `Get a free roof inspection from Guardian Storm Repair! Referred by ${repName}.`,
          url: referralUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        console.error('Share failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `guardian-referral-${repId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const shareOptions = [
    {
      icon: MessageSquare,
      label: 'Text Message',
      action: () => window.open(`sms:?body=${encodeURIComponent(`Check out Guardian Storm Repair for a free roof inspection: ${referralUrl}`)}`),
    },
    {
      icon: Mail,
      label: 'Email',
      action: () => window.open(`mailto:?subject=${encodeURIComponent('Free Roof Inspection')}&body=${encodeURIComponent(`Hi!\n\nI wanted to share Guardian Storm Repair with you. They offer free roof inspections.\n\nUse my link: ${referralUrl}\n\nThanks!`)}`),
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button
            variant="outline"
            className={clsx(
              'bg-guardian-gold/10 border-guardian-gold/30 text-guardian-gold',
              'hover:bg-guardian-gold/20 hover:border-guardian-gold/50',
              className
            )}
          >
            <QrCode className="w-4 h-4 mr-2" />
            Share My Link
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="bg-slate-900 border-slate-800 rounded-t-3xl max-h-[90vh] overflow-auto"
      >
        <SheetHeader className="text-center pb-4">
          <SheetTitle className="text-xl text-white">Share Your Referral Link</SheetTitle>
          <SheetDescription className="text-slate-400">
            Scan the QR code or share your unique link
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* QR Code */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="p-4 bg-white rounded-2xl shadow-xl">
              <QRCodeSVG
                id="qr-code-svg"
                value={referralUrl}
                size={200}
                level="H"
                includeMargin={false}
                fgColor="#0F172A"
                bgColor="#FFFFFF"
              />
            </div>
          </motion.div>

          {/* URL Display + Copy */}
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <LinkIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="flex-1 text-sm text-slate-300 truncate font-mono">
              {referralUrl}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="flex-shrink-0 text-slate-400 hover:text-white"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Copy className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleShare}
              className="bg-guardian-gold hover:bg-guardian-gold/90 text-slate-900 font-semibold"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
            <Button
              onClick={handleDownloadQR}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Save QR
            </Button>
          </div>

          {/* Additional Share Options */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500 text-center">Or share via</p>
            <div className="flex justify-center gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={option.action}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors min-w-[80px]"
                >
                  <option.icon className="w-5 h-5 text-slate-400" />
                  <span className="text-xs text-slate-400">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-sm text-emerald-400">
              💡 Tip: Share with customers right after a successful job for best results!
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default QRCodeSheet;
