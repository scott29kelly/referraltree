import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Store referrals in a JSON file for persistence during demo
const DATA_FILE = join(process.cwd(), 'demo-referrals.json');

interface DemoReferral {
  id: string;
  referrer_id: string;
  referee_name: string;
  referee_phone: string | null;
  referee_email: string | null;
  notes: string | null;
  status: string;
  value: number;
  created_at: string;
  updated_at: string;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function loadReferrals(): DemoReferral[] {
  try {
    if (existsSync(DATA_FILE)) {
      const data = readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading referrals:', err);
  }
  return [];
}

function saveReferrals(referrals: DemoReferral[]): void {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(referrals, null, 2));
  } catch (err) {
    console.error('Error saving referrals:', err);
  }
}

// GET - fetch all demo referrals
export async function GET() {
  const referrals = loadReferrals();
  return NextResponse.json({ referrals });
}

// POST - create a new referral
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referrer_id, referee_name, referee_phone, referee_email, notes } = body;

    if (!referee_name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!referee_phone && !referee_email) {
      return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 });
    }

    const referrals = loadReferrals();

    const newReferral: DemoReferral = {
      id: generateUUID(),
      referrer_id: referrer_id || 'd4e5f6a7-b8c9-0123-def0-234567890123', // Default to John Smith
      referee_name,
      referee_phone: referee_phone || null,
      referee_email: referee_email || null,
      notes: notes || null,
      status: 'submitted',
      value: 125,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    referrals.unshift(newReferral); // Add to beginning
    saveReferrals(referrals);

    return NextResponse.json({ referral: newReferral });
  } catch (err) {
    console.error('Error creating referral:', err);
    return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
  }
}

// PATCH - update referral status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const referrals = loadReferrals();
    const index = referrals.findIndex((r) => r.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }

    referrals[index].status = status;
    referrals[index].updated_at = new Date().toISOString();
    saveReferrals(referrals);

    return NextResponse.json({ referral: referrals[index] });
  } catch (err) {
    console.error('Error updating referral:', err);
    return NextResponse.json({ error: 'Failed to update referral' }, { status: 500 });
  }
}
