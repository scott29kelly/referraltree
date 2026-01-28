'use client';

import { ReferralTree } from '@/components/referral-tree';
import CustomerHeader from '@/components/ui/CustomerHeader';

interface CustomerReferralPageProps {
  params: Promise<{
    customerId: string;
  }>;
}

export default function CustomerReferralPage({ params }: CustomerReferralPageProps) {
  // In production, we would fetch the customer's referrals from Supabase
  // using the customerId from params

  return (
    <>
      <CustomerHeader />
      <div className="h-screen w-screen overflow-hidden pt-16">
        <ReferralTree />
      </div>
    </>
  );
}
