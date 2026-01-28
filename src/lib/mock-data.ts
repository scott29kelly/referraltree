// Mock data for Guardianship App
// Uses consistent UUIDs so relationships work correctly

import type { Rep, Customer, Referral, RepCustomer, Activity } from '@/types/database';

// Rep UUIDs - 2 Admins, 6 Regular Reps
const REP_ADMIN_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const REP_ADMIN_2_ID = 'a2b3c4d5-e6f7-8901-bcde-f12345678902';
const REP_SARAH_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
const REP_MIKE_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012';
const REP_JESSICA_ID = 'd4e5f6a7-b8c9-0123-def0-234567890124';
const REP_MARCUS_ID = 'e5f6a7b8-c9d0-1234-ef01-345678901235';
const REP_PRIYA_ID = 'f6a7b8c9-d0e1-2345-f012-456789012346';
const REP_CARLOS_ID = 'a7b8c9d0-e1f2-3456-0123-567890123457';

// Customer UUIDs
const CUSTOMER_IDS = [
  'd4e5f6a7-b8c9-0123-def0-234567890123', // John Smith
  'e5f6a7b8-c9d0-1234-ef01-345678901234', // Maria Garcia
  'f6a7b8c9-d0e1-2345-f012-456789012345', // Robert Johnson
  'a7b8c9d0-e1f2-3456-0123-567890123456', // Emily Chen
  'b8c9d0e1-f2a3-4567-1234-678901234567', // David Williams
  'c9d0e1f2-a3b4-5678-2345-789012345678', // Sarah Davis
  'd0e1f2a3-b4c5-6789-3456-890123456789', // James Brown
  'e1f2a3b4-c5d6-7890-4567-901234567890', // Lisa Miller
  'f2a3b4c5-d6e7-8901-5678-012345678901', // Michael Wilson
  'a3b4c5d6-e7f8-9012-6789-123456789012', // Jennifer Taylor
  'b4c5d6e7-f8a9-0123-7890-234567890123', // Anthony Martinez
  'c5d6e7f8-a9b0-1234-8901-345678901234', // Patricia Anderson
  'd6e7f8a9-b0c1-2345-9012-456789012345', // Christopher Lee
  'e7f8a9b0-c1d2-3456-0123-567890123456', // Amanda Jackson
  'f8a9b0c1-d2e3-4567-1234-678901234567', // Daniel Harris
];

// Referral UUIDs
const REFERRAL_IDS = [
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77777777-7777-7777-7777-777777777777',
  '88888888-8888-8888-8888-888888888888',
  '99999999-9999-9999-9999-999999999999',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  '12121212-1212-1212-1212-121212121212',
  '23232323-2323-2323-2323-232323232323',
  '34343434-3434-3434-3434-343434343434',
  '45454545-4545-4545-4545-454545454545',
  '56565656-5656-5656-5656-565656565656',
  '67676767-6767-6767-6767-676767676767',
  '78787878-7878-7878-7878-787878787878',
  '89898989-8989-8989-8989-898989898989',
  '90909090-9090-9090-9090-909090909090',
  'abababab-abab-abab-abab-abababababab',
  'bcbcbcbc-bcbc-bcbc-bcbc-bcbcbcbcbcbc',
  'cdcdcdcd-cdcd-cdcd-cdcd-cdcdcdcdcdcd',
  'dededede-dede-dede-dede-dededededede',
  'efefefef-efef-efef-efef-efefefefefef',
  '01010101-0101-0101-0101-010101010101',
];

// Mock Reps - 2 Admins + 6 Regular Reps
export const mockReps: Rep[] = [
  {
    id: REP_ADMIN_ID,
    name: 'Alex Thompson',
    email: 'alex@guardian.com',
    role: 'admin',
    avatar_url: null,
    active: true,
    created_at: '2024-01-15T09:00:00Z', // Veteran - founding admin
  },
  {
    id: REP_ADMIN_2_ID,
    name: 'Rachel Nguyen',
    email: 'rachel.nguyen@guardian.com',
    role: 'admin',
    avatar_url: null,
    active: true,
    created_at: '2024-06-01T10:30:00Z', // Promoted to admin mid-year
  },
  {
    id: REP_SARAH_ID,
    name: 'Sarah Martinez',
    email: 'sarah@guardian.com',
    role: 'rep',
    avatar_url: null,
    active: true,
    created_at: '2024-02-20T08:00:00Z', // Early hire
  },
  {
    id: REP_MIKE_ID,
    name: 'Mike Rodriguez',
    email: 'mike@guardian.com',
    role: 'rep',
    avatar_url: null,
    active: true,
    created_at: '2024-03-10T11:00:00Z', // Experienced rep
  },
  {
    id: REP_JESSICA_ID,
    name: 'Jessica Chen',
    email: 'jessica.chen@guardian.com',
    role: 'rep',
    avatar_url: null,
    active: true,
    created_at: '2024-08-15T09:30:00Z', // Mid-year hire
  },
  {
    id: REP_MARCUS_ID,
    name: 'Marcus Johnson',
    email: 'marcus.johnson@guardian.com',
    role: 'rep',
    avatar_url: null,
    active: true,
    created_at: '2025-01-05T08:00:00Z', // New year hire
  },
  {
    id: REP_PRIYA_ID,
    name: 'Priya Patel',
    email: 'priya.patel@guardian.com',
    role: 'rep',
    avatar_url: null,
    active: true,
    created_at: '2025-09-20T10:00:00Z', // Recent hire - 4 months ago
  },
  {
    id: REP_CARLOS_ID,
    name: 'Carlos Rivera',
    email: 'carlos.rivera@guardian.com',
    role: 'rep',
    avatar_url: null,
    active: true,
    created_at: '2026-01-06T09:00:00Z', // Brand new hire - 3 weeks ago
  },
];

// Mock Customers - spread from Jan 2024 to Jan 2027
export const mockCustomers: Customer[] = [
  {
    id: CUSTOMER_IDS[0],
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john.smith@email.com',
    created_at: '2024-01-20T10:00:00Z', // Very early customer
  },
  {
    id: CUSTOMER_IDS[1],
    name: 'Maria Garcia',
    phone: '(555) 234-5678',
    email: 'maria.garcia@email.com',
    created_at: '2024-04-15T14:30:00Z',
  },
  {
    id: CUSTOMER_IDS[2],
    name: 'Robert Johnson',
    phone: '(555) 345-6789',
    email: 'robert.j@email.com',
    created_at: '2024-07-22T09:15:00Z',
  },
  {
    id: CUSTOMER_IDS[3],
    name: 'Emily Chen',
    phone: '(555) 456-7890',
    email: 'emily.chen@email.com',
    created_at: '2024-10-05T11:45:00Z',
  },
  {
    id: CUSTOMER_IDS[4],
    name: 'David Williams',
    phone: '(555) 567-8901',
    email: 'david.w@email.com',
    created_at: '2025-01-12T16:20:00Z',
  },
  {
    id: CUSTOMER_IDS[5],
    name: 'Sarah Davis',
    phone: '(555) 678-9012',
    email: 'sarah.davis@email.com',
    created_at: '2025-04-08T08:00:00Z',
  },
  {
    id: CUSTOMER_IDS[6],
    name: 'James Brown',
    phone: '(555) 789-0123',
    email: 'james.brown@email.com',
    created_at: '2025-07-19T13:30:00Z',
  },
  {
    id: CUSTOMER_IDS[7],
    name: 'Lisa Miller',
    phone: '(555) 890-1234',
    email: 'lisa.m@email.com',
    created_at: '2025-10-28T10:45:00Z',
  },
  {
    id: CUSTOMER_IDS[8],
    name: 'Michael Wilson',
    phone: '(555) 901-2345',
    email: 'michael.w@email.com',
    created_at: '2026-02-14T15:00:00Z',
  },
  {
    id: CUSTOMER_IDS[9],
    name: 'Jennifer Taylor',
    phone: '(555) 012-3456',
    email: 'jennifer.t@email.com',
    created_at: '2026-05-30T12:15:00Z',
  },
  {
    id: CUSTOMER_IDS[10],
    name: 'Anthony Martinez',
    phone: '(555) 111-2233',
    email: 'anthony.m@email.com',
    created_at: '2026-08-17T09:30:00Z',
  },
  {
    id: CUSTOMER_IDS[11],
    name: 'Patricia Anderson',
    phone: '(555) 222-3344',
    email: 'patricia.a@email.com',
    created_at: '2026-10-05T14:00:00Z',
  },
  {
    id: CUSTOMER_IDS[12],
    name: 'Christopher Lee',
    phone: '(555) 333-4455',
    email: 'chris.lee@email.com',
    created_at: '2026-11-22T11:30:00Z',
  },
  {
    id: CUSTOMER_IDS[13],
    name: 'Amanda Jackson',
    phone: '(555) 444-5566',
    email: 'amanda.j@email.com',
    created_at: '2026-01-10T10:00:00Z', // Very recent
  },
  {
    id: CUSTOMER_IDS[14],
    name: 'Daniel Harris',
    phone: '(555) 555-6677',
    email: 'daniel.h@email.com',
    created_at: '2026-01-20T16:45:00Z', // Last week
  },
];

// Mock Referrals - dates ranging from 6 months ago to today
// Today is ~Jan 28, 2026, so 6 months ago is ~Jul 28, 2025
export const mockReferrals: Referral[] = [
  // Very old referrals (5-6 months ago) - all should be sold
  {
    id: REFERRAL_IDS[0],
    referrer_id: CUSTOMER_IDS[0],
    referee_name: 'Tom Anderson',
    referee_phone: '(555) 111-2222',
    referee_email: 'tom.a@email.com',
    status: 'sold',
    value: 250,
    notes: 'Great referral, quick close!',
    created_at: '2025-07-28T10:00:00Z',
    updated_at: '2025-08-15T14:00:00Z', // Sold ~18 days later
  },
  {
    id: REFERRAL_IDS[1],
    referrer_id: CUSTOMER_IDS[1],
    referee_name: 'Nancy White',
    referee_phone: '(555) 222-3333',
    referee_email: 'nancy.w@email.com',
    status: 'sold',
    value: 250,
    notes: 'Insurance approved quickly',
    created_at: '2025-08-05T11:30:00Z',
    updated_at: '2025-08-28T09:00:00Z', // Sold ~23 days later
  },
  {
    id: REFERRAL_IDS[2],
    referrer_id: CUSTOMER_IDS[2],
    referee_name: 'Peter Clark',
    referee_phone: '(555) 333-4444',
    referee_email: 'peter.c@email.com',
    status: 'sold',
    value: 250,
    notes: 'Full roof replacement',
    created_at: '2025-08-12T08:45:00Z',
    updated_at: '2025-09-05T10:00:00Z', // Sold ~24 days later
  },
  // 4-5 months old referrals - mix of sold and quoted
  {
    id: REFERRAL_IDS[3],
    referrer_id: CUSTOMER_IDS[3],
    referee_name: 'Kevin Lee',
    referee_phone: '(555) 444-5555',
    referee_email: 'kevin.lee@email.com',
    status: 'sold',
    value: 250,
    notes: 'Roof replacement complete',
    created_at: '2025-09-10T14:00:00Z',
    updated_at: '2025-10-02T16:30:00Z', // Sold ~22 days later
  },
  {
    id: REFERRAL_IDS[4],
    referrer_id: CUSTOMER_IDS[4],
    referee_name: 'Amy Martinez',
    referee_phone: '(555) 555-6666',
    referee_email: 'amy.m@email.com',
    status: 'sold',
    value: 250,
    notes: 'Storm damage claim',
    created_at: '2025-09-18T09:30:00Z',
    updated_at: '2025-10-12T11:00:00Z', // Sold ~24 days later
  },
  {
    id: REFERRAL_IDS[5],
    referrer_id: CUSTOMER_IDS[5],
    referee_name: 'Brian Hughes',
    referee_phone: '(555) 666-7777',
    referee_email: 'brian.h@email.com',
    status: 'sold',
    value: 250,
    notes: 'Premium shingles selected',
    created_at: '2025-09-25T16:00:00Z',
    updated_at: '2025-10-20T14:00:00Z', // Sold ~25 days later
  },
  // 3-4 months old - mix of statuses
  {
    id: REFERRAL_IDS[6],
    referrer_id: CUSTOMER_IDS[6],
    referee_name: 'Sandra Kim',
    referee_phone: '(555) 777-8888',
    referee_email: 'sandra.k@email.com',
    status: 'sold',
    value: 250,
    notes: 'Large project completed',
    created_at: '2025-10-08T10:15:00Z',
    updated_at: '2025-11-01T14:30:00Z', // Sold ~24 days later
  },
  {
    id: REFERRAL_IDS[7],
    referrer_id: CUSTOMER_IDS[7],
    referee_name: 'George Harris',
    referee_phone: '(555) 888-9999',
    referee_email: 'george.h@email.com',
    status: 'quoted',
    value: 250,
    notes: 'Comparing with other contractors',
    created_at: '2025-10-15T13:00:00Z',
    updated_at: '2025-10-22T09:45:00Z', // Quoted ~7 days after submission
  },
  {
    id: REFERRAL_IDS[8],
    referrer_id: CUSTOMER_IDS[8],
    referee_name: 'Rachel Green',
    referee_phone: '(555) 999-0000',
    referee_email: 'rachel.g@email.com',
    status: 'sold',
    value: 250,
    notes: 'Insurance claim approved',
    created_at: '2025-10-22T11:00:00Z',
    updated_at: '2025-11-15T15:00:00Z', // Sold ~24 days later
  },
  // 2-3 months old
  {
    id: REFERRAL_IDS[9],
    referrer_id: CUSTOMER_IDS[9],
    referee_name: 'Daniel Moore',
    referee_phone: '(555) 000-1111',
    referee_email: 'daniel.m@email.com',
    status: 'sold',
    value: 250,
    notes: 'Excellent customer experience',
    created_at: '2025-11-05T08:30:00Z',
    updated_at: '2025-11-28T10:00:00Z', // Sold ~23 days later
  },
  {
    id: REFERRAL_IDS[10],
    referrer_id: CUSTOMER_IDS[10],
    referee_name: 'Michelle Scott',
    referee_phone: '(555) 111-0000',
    referee_email: 'michelle.s@email.com',
    status: 'quoted',
    value: 250,
    notes: 'Reviewing financing options',
    created_at: '2025-11-12T14:45:00Z',
    updated_at: '2025-11-19T11:30:00Z', // Quoted ~7 days later
  },
  {
    id: REFERRAL_IDS[11],
    referrer_id: CUSTOMER_IDS[11],
    referee_name: 'Chris Evans',
    referee_phone: '(555) 222-1111',
    referee_email: 'chris.e@email.com',
    status: 'quoted',
    value: 250,
    notes: 'Waiting on HOA approval',
    created_at: '2025-11-20T09:00:00Z',
    updated_at: '2025-11-28T15:00:00Z', // Quoted ~8 days later
  },
  // 1-2 months old
  {
    id: REFERRAL_IDS[12],
    referrer_id: CUSTOMER_IDS[12],
    referee_name: 'Laura Adams',
    referee_phone: '(555) 333-2222',
    referee_email: 'laura.a@email.com',
    status: 'quoted',
    value: 250,
    notes: 'Scheduled inspection completed',
    created_at: '2025-12-02T10:30:00Z',
    updated_at: '2025-12-10T08:00:00Z', // Quoted ~8 days later
  },
  {
    id: REFERRAL_IDS[13],
    referrer_id: CUSTOMER_IDS[0],
    referee_name: 'Mark Thompson',
    referee_phone: '(555) 444-3333',
    referee_email: 'mark.t@email.com',
    status: 'sold',
    value: 250,
    notes: 'Completed ahead of schedule',
    created_at: '2025-12-08T15:00:00Z',
    updated_at: '2026-01-02T12:00:00Z', // Sold ~25 days later
  },
  {
    id: REFERRAL_IDS[14],
    referrer_id: CUSTOMER_IDS[1],
    referee_name: 'Paul Wilson',
    referee_phone: '(555) 555-4444',
    referee_email: 'paul.w@email.com',
    status: 'contacted',
    value: 250,
    notes: 'Initial call completed, follow-up scheduled',
    created_at: '2025-12-15T11:15:00Z',
    updated_at: '2025-12-17T14:00:00Z', // Contacted ~2 days later
  },
  {
    id: REFERRAL_IDS[15],
    referrer_id: CUSTOMER_IDS[2],
    referee_name: 'Kelly Brown',
    referee_phone: '(555) 666-5555',
    referee_email: 'kelly.b@email.com',
    status: 'quoted',
    value: 250,
    notes: 'Quote sent, awaiting response',
    created_at: '2025-12-20T08:00:00Z',
    updated_at: '2025-12-28T10:30:00Z', // Quoted ~8 days later
  },
  // 2-4 weeks old
  {
    id: REFERRAL_IDS[16],
    referrer_id: CUSTOMER_IDS[3],
    referee_name: 'Steve Rogers',
    referee_phone: '(555) 777-6666',
    referee_email: 'steve.r@email.com',
    status: 'contacted',
    value: 250,
    notes: 'Site visit scheduled for next week',
    created_at: '2026-01-02T09:45:00Z',
    updated_at: '2026-01-04T11:30:00Z', // Contacted ~2 days later
  },
  {
    id: REFERRAL_IDS[17],
    referrer_id: CUSTOMER_IDS[4],
    referee_name: 'Diana Prince',
    referee_phone: '(555) 888-7777',
    referee_email: 'diana.p@email.com',
    status: 'quoted',
    value: 250,
    notes: 'Premium package quoted',
    created_at: '2026-01-05T14:00:00Z',
    updated_at: '2026-01-12T16:00:00Z', // Quoted ~7 days later
  },
  {
    id: REFERRAL_IDS[18],
    referrer_id: CUSTOMER_IDS[5],
    referee_name: 'Bruce Wayne',
    referee_phone: '(555) 999-8888',
    referee_email: 'bruce.w@email.com',
    status: 'contacted',
    value: 250,
    notes: 'High-value property, premium options discussed',
    created_at: '2026-01-08T16:30:00Z',
    updated_at: '2026-01-10T10:00:00Z', // Contacted ~2 days later
  },
  // 1-2 weeks old
  {
    id: REFERRAL_IDS[19],
    referrer_id: CUSTOMER_IDS[6],
    referee_name: 'Clark Kent',
    referee_phone: '(555) 000-9999',
    referee_email: 'clark.k@email.com',
    status: 'contacted',
    value: 250,
    notes: 'Inspection scheduled',
    created_at: '2026-01-12T10:00:00Z',
    updated_at: '2026-01-14T13:00:00Z', // Contacted ~2 days later
  },
  {
    id: REFERRAL_IDS[20],
    referrer_id: CUSTOMER_IDS[7],
    referee_name: 'Lois Lane',
    referee_phone: '(555) 111-9999',
    referee_email: 'lois.l@email.com',
    status: 'submitted',
    value: 250,
    notes: 'Priority referral from top customer',
    created_at: '2026-01-15T07:30:00Z',
    updated_at: '2026-01-15T07:30:00Z', // Just submitted
  },
  {
    id: REFERRAL_IDS[21],
    referrer_id: CUSTOMER_IDS[8],
    referee_name: 'Tony Stark',
    referee_phone: '(555) 222-8888',
    referee_email: 'tony.s@email.com',
    status: 'contacted',
    value: 250,
    notes: 'Meeting scheduled for this week',
    created_at: '2026-01-16T12:00:00Z',
    updated_at: '2026-01-18T09:00:00Z', // Contacted ~2 days later
  },
  // Last week (very recent)
  {
    id: REFERRAL_IDS[22],
    referrer_id: CUSTOMER_IDS[9],
    referee_name: 'Pepper Potts',
    referee_phone: '(555) 333-7777',
    referee_email: 'pepper.p@email.com',
    status: 'submitted',
    value: 250,
    notes: 'Referred by spouse of existing customer',
    created_at: '2026-01-20T15:30:00Z',
    updated_at: '2026-01-20T15:30:00Z', // Just submitted
  },
  {
    id: REFERRAL_IDS[23],
    referrer_id: CUSTOMER_IDS[10],
    referee_name: 'Natasha Romanoff',
    referee_phone: '(555) 444-6666',
    referee_email: 'natasha.r@email.com',
    status: 'contacted',
    value: 250,
    notes: 'Initial consultation completed',
    created_at: '2026-01-21T08:00:00Z',
    updated_at: '2026-01-23T15:00:00Z', // Contacted ~2 days later
  },
  {
    id: REFERRAL_IDS[24],
    referrer_id: CUSTOMER_IDS[11],
    referee_name: 'Clint Barton',
    referee_phone: '(555) 555-5555',
    referee_email: 'clint.b@email.com',
    status: 'submitted',
    value: 250,
    notes: 'New referral from returning customer',
    created_at: '2026-01-22T10:00:00Z',
    updated_at: '2026-01-22T10:00:00Z', // Just submitted
  },
  // This week (brand new)
  {
    id: REFERRAL_IDS[25],
    referrer_id: CUSTOMER_IDS[12],
    referee_name: 'Wanda Maximoff',
    referee_phone: '(555) 666-4444',
    referee_email: 'wanda.m@email.com',
    status: 'submitted',
    value: 250,
    notes: 'Urgent - storm damage',
    created_at: '2026-01-24T09:15:00Z',
    updated_at: '2026-01-24T09:15:00Z', // Just submitted
  },
  {
    id: REFERRAL_IDS[26],
    referrer_id: CUSTOMER_IDS[13],
    referee_name: 'Vision Smith',
    referee_phone: '(555) 777-3333',
    referee_email: 'vision.s@email.com',
    status: 'submitted',
    value: 250,
    notes: null,
    created_at: '2026-01-25T14:30:00Z',
    updated_at: '2026-01-25T14:30:00Z', // Just submitted
  },
  {
    id: REFERRAL_IDS[27],
    referrer_id: CUSTOMER_IDS[14],
    referee_name: 'Scott Lang',
    referee_phone: '(555) 888-2222',
    referee_email: 'scott.l@email.com',
    status: 'submitted',
    value: 250,
    notes: 'Family friend referral',
    created_at: '2026-01-26T11:00:00Z',
    updated_at: '2026-01-26T11:00:00Z', // Yesterday
  },
  {
    id: REFERRAL_IDS[28],
    referrer_id: CUSTOMER_IDS[0],
    referee_name: 'Hope Van Dyne',
    referee_phone: '(555) 999-1111',
    referee_email: 'hope.v@email.com',
    status: 'submitted',
    value: 250,
    notes: 'Second referral from John Smith this month',
    created_at: '2026-01-27T08:00:00Z',
    updated_at: '2026-01-27T08:00:00Z', // Today
  },
];

// Rep-Customer assignments - distributed across all 8 reps
export const mockRepCustomers: RepCustomer[] = [
  // Alex (Admin) handles customers 0-1
  { rep_id: REP_ADMIN_ID, customer_id: CUSTOMER_IDS[0], assigned_at: '2024-01-20T10:00:00Z' },
  { rep_id: REP_ADMIN_ID, customer_id: CUSTOMER_IDS[1], assigned_at: '2024-04-15T14:30:00Z' },
  // Rachel (Admin 2) handles customers 2-3
  { rep_id: REP_ADMIN_2_ID, customer_id: CUSTOMER_IDS[2], assigned_at: '2024-07-22T09:15:00Z' },
  { rep_id: REP_ADMIN_2_ID, customer_id: CUSTOMER_IDS[3], assigned_at: '2024-10-05T11:45:00Z' },
  // Sarah handles customers 4-5
  { rep_id: REP_SARAH_ID, customer_id: CUSTOMER_IDS[4], assigned_at: '2025-01-12T16:20:00Z' },
  { rep_id: REP_SARAH_ID, customer_id: CUSTOMER_IDS[5], assigned_at: '2025-04-08T08:00:00Z' },
  // Mike handles customers 6-7
  { rep_id: REP_MIKE_ID, customer_id: CUSTOMER_IDS[6], assigned_at: '2025-07-19T13:30:00Z' },
  { rep_id: REP_MIKE_ID, customer_id: CUSTOMER_IDS[7], assigned_at: '2025-10-28T10:45:00Z' },
  // Jessica handles customers 8-9
  { rep_id: REP_JESSICA_ID, customer_id: CUSTOMER_IDS[8], assigned_at: '2026-02-14T15:00:00Z' },
  { rep_id: REP_JESSICA_ID, customer_id: CUSTOMER_IDS[9], assigned_at: '2026-05-30T12:15:00Z' },
  // Marcus handles customers 10-11
  { rep_id: REP_MARCUS_ID, customer_id: CUSTOMER_IDS[10], assigned_at: '2026-08-17T09:30:00Z' },
  { rep_id: REP_MARCUS_ID, customer_id: CUSTOMER_IDS[11], assigned_at: '2026-10-05T14:00:00Z' },
  // Priya handles customers 12-13
  { rep_id: REP_PRIYA_ID, customer_id: CUSTOMER_IDS[12], assigned_at: '2026-11-22T11:30:00Z' },
  { rep_id: REP_PRIYA_ID, customer_id: CUSTOMER_IDS[13], assigned_at: '2027-01-10T10:00:00Z' },
  // Carlos handles customer 14 (brand new rep)
  { rep_id: REP_CARLOS_ID, customer_id: CUSTOMER_IDS[14], assigned_at: '2027-01-20T16:45:00Z' },
];

// Mock Activities (recent events - last 2 weeks)
export const mockActivities: Activity[] = [
  {
    id: 'act-1',
    type: 'referral_created',
    description: 'New referral: Hope Van Dyne',
    referral_id: REFERRAL_IDS[28],
    customer_name: 'John Smith',
    rep_name: 'Alex Thompson',
    timestamp: '2026-01-27T08:00:00Z', // Today
  },
  {
    id: 'act-2',
    type: 'referral_created',
    description: 'New referral: Scott Lang',
    referral_id: REFERRAL_IDS[27],
    customer_name: 'Daniel Harris',
    rep_name: 'Carlos Rivera',
    timestamp: '2026-01-26T11:00:00Z', // Yesterday
  },
  {
    id: 'act-3',
    type: 'referral_created',
    description: 'New referral: Vision Smith',
    referral_id: REFERRAL_IDS[26],
    customer_name: 'Amanda Jackson',
    rep_name: 'Priya Patel',
    timestamp: '2026-01-25T14:30:00Z',
  },
  {
    id: 'act-4',
    type: 'referral_created',
    description: 'New referral: Wanda Maximoff',
    referral_id: REFERRAL_IDS[25],
    customer_name: 'Christopher Lee',
    rep_name: 'Priya Patel',
    timestamp: '2026-01-24T09:15:00Z',
  },
  {
    id: 'act-5',
    type: 'status_changed',
    description: 'Natasha Romanoff referral contacted',
    referral_id: REFERRAL_IDS[23],
    customer_name: 'Anthony Martinez',
    rep_name: 'Marcus Johnson',
    timestamp: '2026-01-23T15:00:00Z',
  },
  {
    id: 'act-6',
    type: 'referral_created',
    description: 'New referral: Clint Barton',
    referral_id: REFERRAL_IDS[24],
    customer_name: 'Patricia Anderson',
    rep_name: 'Marcus Johnson',
    timestamp: '2026-01-22T10:00:00Z',
  },
  {
    id: 'act-7',
    type: 'referral_created',
    description: 'New referral: Natasha Romanoff',
    referral_id: REFERRAL_IDS[23],
    customer_name: 'Anthony Martinez',
    rep_name: 'Marcus Johnson',
    timestamp: '2026-01-21T08:00:00Z',
  },
  {
    id: 'act-8',
    type: 'referral_created',
    description: 'New referral: Pepper Potts',
    referral_id: REFERRAL_IDS[22],
    customer_name: 'Jennifer Taylor',
    rep_name: 'Jessica Chen',
    timestamp: '2026-01-20T15:30:00Z',
  },
  {
    id: 'act-9',
    type: 'status_changed',
    description: 'Tony Stark referral contacted',
    referral_id: REFERRAL_IDS[21],
    customer_name: 'Michael Wilson',
    rep_name: 'Jessica Chen',
    timestamp: '2026-01-18T09:00:00Z',
  },
  {
    id: 'act-10',
    type: 'referral_sold',
    description: 'Mark Thompson referral sold!',
    referral_id: REFERRAL_IDS[13],
    customer_name: 'John Smith',
    rep_name: 'Alex Thompson',
    timestamp: '2026-01-02T12:00:00Z',
  },
];

// Export rep IDs for reference
export const REP_IDS = {
  admin: REP_ADMIN_ID,
  admin2: REP_ADMIN_2_ID,
  sarah: REP_SARAH_ID,
  mike: REP_MIKE_ID,
  jessica: REP_JESSICA_ID,
  marcus: REP_MARCUS_ID,
  priya: REP_PRIYA_ID,
  carlos: REP_CARLOS_ID,
};
