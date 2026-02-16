import { User, Barber, Service, Appointment, ShopHours } from '@/types';

export const DEMO_USERS: User[] = [
  {
    id: 'owner-1',
    name: 'Marcus Cole',
    email: 'owner@cutflow.com',
    phone: '555-0100',
    role: 'owner',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'barber-user-1',
    name: 'James Rivera',
    email: 'james@cutflow.com',
    phone: '555-0201',
    role: 'barber',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'barber-user-2',
    name: 'Deon Williams',
    email: 'deon@cutflow.com',
    phone: '555-0202',
    role: 'barber',
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'customer-1',
    name: 'Alex Turner',
    email: 'customer@cutflow.com',
    phone: '555-0301',
    role: 'customer',
    createdAt: '2024-02-01T00:00:00Z',
  },
];

const defaultAvailability = {
  monday: [{ start: '09:00', end: '17:00' }],
  tuesday: [{ start: '09:00', end: '17:00' }],
  wednesday: [{ start: '09:00', end: '17:00' }],
  thursday: [{ start: '09:00', end: '17:00' }],
  friday: [{ start: '09:00', end: '17:00' }],
  saturday: [{ start: '10:00', end: '15:00' }],
  sunday: [],
};

export const DEMO_BARBERS: Barber[] = [
  {
    id: 'barber-owner',
    userId: 'owner-1',
    name: 'Marcus Cole',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    specialty: 'Owner & Master Barber',
    specialtyTags: ['Fades', 'Razor Shave', 'Scissor Cut', 'Hot Towel'],
    bio: 'Shop owner with 15+ years of experience. Specializing in classic and modern cuts.',
    instagram: '@marcuscole_cuts',
    yearsExperience: 15,
    availability: { ...defaultAvailability },
    dateOverrides: {},
    prices: {
      'service-1': 45,
      'service-2': 30,
      'service-3': 65,
    },
    inviteStatus: 'accepted',
  },
  {
    id: 'barber-1',
    userId: 'barber-user-1',
    name: 'James Rivera',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    specialty: 'Fades & Lineups',
    specialtyTags: ['Fades', 'Lineups', 'Skin Fade', 'Taper'],
    bio: 'Precision fade specialist. Clean lines every time.',
    instagram: '@jamesrivera_barber',
    yearsExperience: 8,
    availability: { ...defaultAvailability },
    dateOverrides: {},
    prices: {
      'service-1': 40,
      'service-2': 25,
      'service-3': 60,
    },
    inviteStatus: 'accepted',
  },
  {
    id: 'barber-2',
    userId: 'barber-user-2',
    name: 'Deon Williams',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    specialty: 'Beard Sculpting',
    specialtyTags: ['Beard Sculpting', 'Razor Shave', 'Hot Towel', 'Styling'],
    bio: 'Beard game on point. Sculpting and shaping is my art.',
    instagram: '@deonwilliams_beards',
    yearsExperience: 6,
    availability: {
      ...defaultAvailability,
      wednesday: [],
      saturday: [{ start: '10:00', end: '14:00' }],
    },
    dateOverrides: {},
    prices: {
      'service-1': 35,
      'service-2': 30,
      'service-3': 55,
    },
    inviteStatus: 'accepted',
  },
];

export const DEMO_SERVICES: Service[] = [
  {
    id: 'service-1',
    name: 'Classic Haircut',
    duration: 30,
    price: 35,
    description: 'Traditional cut with clippers and scissors, includes hot towel finish',
  },
  {
    id: 'service-2',
    name: 'Beard Trim & Shape',
    duration: 20,
    price: 25,
    description: 'Precision beard sculpting with straight razor edge-up',
  },
  {
    id: 'service-3',
    name: 'Cut + Beard Combo',
    duration: 45,
    price: 55,
    description: 'Full haircut and beard grooming package with hot towel',
  },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(dayAfter.getDate() + 2);

function formatDate(d: Date, hour: number, minute: number): string {
  const dt = new Date(d);
  dt.setHours(hour, minute, 0, 0);
  return dt.toISOString();
}

export const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-1',
    barberId: 'barber-1',
    customerId: 'customer-1',
    serviceId: 'service-1',
    dateTime: formatDate(tomorrow, 10, 0),
    status: 'Booked',
    createdAt: today.toISOString(),
  },
  {
    id: 'appt-2',
    barberId: 'barber-2',
    customerId: 'customer-1',
    serviceId: 'service-3',
    dateTime: formatDate(dayAfter, 14, 0),
    status: 'Booked',
    createdAt: today.toISOString(),
  },
];

export const DEFAULT_SHOP_HOURS: ShopHours = {
  monday: { open: '09:00', close: '19:00' },
  tuesday: { open: '09:00', close: '19:00' },
  wednesday: { open: '09:00', close: '19:00' },
  thursday: { open: '09:00', close: '19:00' },
  friday: { open: '09:00', close: '19:00' },
  saturday: { open: '09:00', close: '17:00' },
  sunday: null,
};
