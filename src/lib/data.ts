// Data access layer for Guardianship App
// Uses Supabase when configured, falls back to mock data

import { isSupabaseConfigured, getSupabaseClient } from './supabase';
import {
  mockReps,
  mockCustomers,
  mockReferrals,
  mockRepCustomers,
  mockActivities,
} from './mock-data';
import type {
  Rep,
  Customer,
  Referral,
  Activity,
  ReferralStatus,
  CreateReferralInput,
  UpdateReferralInput,
  CreateRepInput,
  UpdateRepInput,
  DashboardStats,
  AdminStats,
  RepWithStats,
} from '@/types/database';

// Helper to check if we should use Supabase
function useSupabase(): boolean {
  return isSupabaseConfigured();
}

// Helper to generate UUID (works in all browser contexts)
function generateUUID(): string {
  // Use crypto.randomUUID if available, otherwise fallback
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============ REPS ============

export async function getRep(id: string): Promise<Rep | null> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('reps')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }
  return mockReps.find((r) => r.id === id) || null;
}

export async function getRepByEmail(email: string): Promise<Rep | null> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('reps')
      .select('*')
      .eq('email', email)
      .single();
    if (error) return null;
    return data;
  }
  return mockReps.find((r) => r.email === email) || null;
}

export async function getReps(): Promise<Rep[]> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('reps')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data;
  }
  return mockReps;
}

export async function createRep(input: CreateRepInput): Promise<Rep | null> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('reps')
      .insert(input)
      .select()
      .single();
    if (error) return null;
    return data;
  }
  // Mock: add to array (in memory only)
  const newRep: Rep = {
    id: generateUUID(),
    name: input.name,
    email: input.email,
    role: input.role || 'rep',
    avatar_url: input.avatar_url || null,
    active: true,
    created_at: new Date().toISOString(),
  };
  mockReps.push(newRep);
  return newRep;
}

export async function updateRep(id: string, input: UpdateRepInput): Promise<Rep | null> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('reps')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  }
  // Mock: update in array
  const index = mockReps.findIndex((r) => r.id === id);
  if (index === -1) return null;
  mockReps[index] = { ...mockReps[index], ...input };
  return mockReps[index];
}

export async function getRepsWithStats(): Promise<RepWithStats[]> {
  const reps = await getReps();
  const referrals = await getReferrals();
  const repCustomerMap = await getRepCustomerMap();

  return reps.map((rep) => {
    const customerIds = repCustomerMap.get(rep.id) || [];
    const repReferrals = referrals.filter((r) =>
      customerIds.includes(r.referrer_id)
    );
    const soldReferrals = repReferrals.filter((r) => r.status === 'sold');

    return {
      ...rep,
      total_referrals: repReferrals.length,
      total_sold: soldReferrals.length,
      total_earnings: soldReferrals.reduce((sum, r) => sum + r.value, 0),
      pending_earnings: repReferrals
        .filter((r) => r.status !== 'sold')
        .reduce((sum, r) => sum + r.value, 0),
    };
  });
}

// ============ CUSTOMERS ============

export async function getCustomer(id: string): Promise<Customer | null> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }
  return mockCustomers.find((c) => c.id === id) || null;
}

export async function getCustomers(): Promise<Customer[]> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data;
  }
  return mockCustomers;
}

export async function getCustomersByRep(repId: string): Promise<Customer[]> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('rep_customers')
      .select('customer_id')
      .eq('rep_id', repId);
    if (error) return [];

    const customerIds = data.map((rc) => rc.customer_id);
    const { data: customers, error: custError } = await supabase
      .from('customers')
      .select('*')
      .in('id', customerIds)
      .order('created_at', { ascending: false });
    if (custError) return [];
    return customers;
  }

  const customerIds = mockRepCustomers
    .filter((rc) => rc.rep_id === repId)
    .map((rc) => rc.customer_id);
  return mockCustomers.filter((c) => customerIds.includes(c.id));
}

// ============ REFERRALS ============

export async function getReferral(id: string): Promise<Referral | null> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }
  return mockReferrals.find((r) => r.id === id) || null;
}

export async function getReferrals(): Promise<Referral[]> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data;
  }
  
  // Merge mock data with demo referrals (from JSON file or API)
  let demoReferrals: Referral[] = [];
  try {
    if (typeof window !== 'undefined') {
      // Client-side: fetch from API
      const response = await fetch('/api/referrals');
      if (response.ok) {
        const data = await response.json();
        demoReferrals = data.referrals || [];
      }
    } else {
      // Server-side: read JSON file directly
      const fs = await import('fs');
      const path = await import('path');
      const dataFile = path.join(process.cwd(), 'demo-referrals.json');
      if (fs.existsSync(dataFile)) {
        const fileData = fs.readFileSync(dataFile, 'utf-8');
        demoReferrals = JSON.parse(fileData);
      }
    }
  } catch {
    // Ignore errors, just use mock data
  }
  
  // Combine and sort by date (demo referrals first since they're newer)
  const allReferrals = [...demoReferrals, ...mockReferrals];
  return allReferrals.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getReferralsByCustomer(customerId: string): Promise<Referral[]> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', customerId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data;
  }
  return mockReferrals
    .filter((r) => r.referrer_id === customerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getReferralsByRep(repId: string): Promise<Referral[]> {
  const customers = await getCustomersByRep(repId);
  const customerIds = customers.map((c) => c.id);

  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .in('referrer_id', customerIds)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data;
  }

  return mockReferrals
    .filter((r) => customerIds.includes(r.referrer_id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createReferral(input: CreateReferralInput): Promise<Referral | null> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        ...input,
        status: 'submitted',
        value: 125,
      })
      .select()
      .single();
    if (error) return null;
    return data;
  }

  const newReferral: Referral = {
    id: generateUUID(),
    referrer_id: input.referrer_id,
    referee_name: input.referee_name,
    referee_phone: input.referee_phone || null,
    referee_email: input.referee_email || null,
    status: 'submitted',
    value: 125,
    notes: input.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockReferrals.push(newReferral);
  return newReferral;
}

export async function updateReferral(
  id: string,
  input: UpdateReferralInput
): Promise<Referral | null> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase
      .from('referrals')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  }

  const index = mockReferrals.findIndex((r) => r.id === id);
  if (index === -1) return null;
  mockReferrals[index] = {
    ...mockReferrals[index],
    ...input,
    updated_at: new Date().toISOString(),
  };
  return mockReferrals[index];
}

export async function updateReferralStatus(
  id: string,
  status: ReferralStatus
): Promise<Referral | null> {
  return updateReferral(id, { status });
}

// ============ ACTIVITIES ============

export async function getActivities(limit = 10): Promise<Activity[]> {
  // For now, always use mock activities
  // In production, this would aggregate from referral changes
  return mockActivities.slice(0, limit);
}

export async function getActivitiesByRep(repId: string, limit = 10): Promise<Activity[]> {
  const rep = await getRep(repId);
  if (!rep) return [];

  return mockActivities
    .filter((a) => a.rep_name === rep.name)
    .slice(0, limit);
}

// ============ STATS ============

export async function getDashboardStats(repId: string): Promise<DashboardStats> {
  const referrals = await getReferralsByRep(repId);

  const submitted = referrals.filter((r) => r.status === 'submitted').length;
  const contacted = referrals.filter((r) => r.status === 'contacted').length;
  const quoted = referrals.filter((r) => r.status === 'quoted').length;
  const sold = referrals.filter((r) => r.status === 'sold').length;

  return {
    total_referrals: referrals.length,
    submitted,
    contacted,
    quoted,
    sold,
    total_earnings: sold * 125,
    pending_earnings: (submitted + contacted + quoted) * 125,
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  const referrals = await getReferrals();
  const reps = await getReps();
  const activeReps = reps.filter((r) => r.active);

  const submitted = referrals.filter((r) => r.status === 'submitted').length;
  const contacted = referrals.filter((r) => r.status === 'contacted').length;
  const quoted = referrals.filter((r) => r.status === 'quoted').length;
  const sold = referrals.filter((r) => r.status === 'sold').length;

  const totalEarnings = sold * 125;
  const conversionRate = referrals.length > 0 ? (sold / referrals.length) * 100 : 0;

  return {
    total_referrals: referrals.length,
    submitted,
    contacted,
    quoted,
    sold,
    total_earnings: totalEarnings,
    pending_earnings: (submitted + contacted + quoted) * 125,
    total_reps: reps.length,
    active_reps: activeReps.length,
    conversion_rate: Math.round(conversionRate * 10) / 10,
    total_paid_out: totalEarnings, // In reality, this would track actual payouts
  };
}

// ============ HELPERS ============

async function getRepCustomerMap(): Promise<Map<string, string[]>> {
  if (useSupabase()) {
    const supabase = getSupabaseClient()!;
    const { data, error } = await supabase.from('rep_customers').select('*');
    if (error) return new Map();

    const map = new Map<string, string[]>();
    data.forEach((rc) => {
      const existing = map.get(rc.rep_id) || [];
      existing.push(rc.customer_id);
      map.set(rc.rep_id, existing);
    });
    return map;
  }

  const map = new Map<string, string[]>();
  mockRepCustomers.forEach((rc) => {
    const existing = map.get(rc.rep_id) || [];
    existing.push(rc.customer_id);
    map.set(rc.rep_id, existing);
  });
  return map;
}

// Get customer with referrer (for display)
export async function getCustomerWithReferrals(customerId: string) {
  const customer = await getCustomer(customerId);
  if (!customer) return null;

  const referrals = await getReferralsByCustomer(customerId);
  return { ...customer, referrals };
}

// Get referral with customer info
export async function getReferralWithCustomer(referralId: string) {
  const referral = await getReferral(referralId);
  if (!referral) return null;

  const customer = await getCustomer(referral.referrer_id);
  return { ...referral, referrer: customer };
}
