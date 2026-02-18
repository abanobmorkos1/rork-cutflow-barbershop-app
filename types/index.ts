export type UserRole = 'owner' | 'barber' | 'customer';

export type InviteStatus = 'pending' | 'accepted';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  shopId?: string;
  createdAt: string;
}

export interface Shop {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  city: string;
  description: string;
  image: string;
  phone: string;
  rating: number;
  reviewCount: number;
  hours: ShopHours;
  createdAt: string;
}

export const BARBER_SPECIALTY_TAGS = [
  'Fades',
  'Lineups',
  'Beard Sculpting',
  'Razor Shave',
  'Afro Styling',
  'Dreadlocks',
  'Braids',
  'Kids Cuts',
  'Color & Dye',
  'Hair Design',
  'Texturizing',
  'Hot Towel',
  'Skin Fade',
  'Taper',
  'Mohawk',
  'Flat Top',
  'Buzz Cut',
  'Scissor Cut',
  'Hair Wash',
  'Styling',
] as const;

export type BarberSpecialtyTag = typeof BARBER_SPECIALTY_TAGS[number];

export interface Barber {
  id: string;
  userId: string;
  shopId: string;
  name: string;
  avatar: string;
  specialty: string;
  specialtyTags: BarberSpecialtyTag[];
  bio: string;
  instagram: string;
  yearsExperience: number;
  availability: WeeklyAvailability;
  dateOverrides?: DateOverrides;
  prices?: BarberPrices;
  inviteStatus?: InviteStatus;
  inviteEmail?: string;
}

export interface WeeklyAvailability {
  [day: string]: DaySlot[];
}

export interface DaySlot {
  start: string;
  end: string;
}

export interface DateOverrides {
  [dateStr: string]: DaySlot[];
}

export interface BarberPrices {
  [serviceId: string]: number;
}

export interface Service {
  id: string;
  shopId: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

export type AppointmentStatus = 'Booked' | 'Completed' | 'Canceled' | 'NoShow';

export interface Appointment {
  id: string;
  shopId: string;
  barberId: string;
  customerId: string;
  serviceId: string;
  dateTime: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface ShopHours {
  [day: string]: { open: string; close: string } | null;
}

export interface PromoCode {
  id: string;
  barberId: string;
  code: string;
  discountPercent: number;
  validDateStart: string;
  validDateEnd: string;
  isActive: boolean;
  createdAt: string;
}
