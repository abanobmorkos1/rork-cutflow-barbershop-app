import { Barber, Appointment, ShopHours, DaySlot } from '@/types';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

export function getBarberSlotsForDate(date: Date, barber: Barber): DaySlot[] {
  const dateStr = toDateStr(date);
  if (barber.dateOverrides && dateStr in barber.dateOverrides) {
    return barber.dateOverrides[dateStr];
  }
  const dayName = DAYS[date.getDay()];
  return barber.availability[dayName] || [];
}

export function getAvailableSlots(
  date: Date,
  barber: Barber,
  shopHours: ShopHours,
  appointments: Appointment[],
  serviceDuration: number
): string[] {
  const dayName = DAYS[date.getDay()];
  const shop = shopHours[dayName];
  if (!shop) return [];

  const barberSlots = getBarberSlotsForDate(date, barber);
  if (barberSlots.length === 0) return [];

  const shopOpen = timeToMinutes(shop.open);
  const shopClose = timeToMinutes(shop.close);

  const dateStr = toDateStr(date);

  const bookedTimes = appointments
    .filter(
      (a) =>
        a.barberId === barber.id &&
        a.status === 'Booked' &&
        a.dateTime.startsWith(dateStr)
    )
    .map((a) => {
      const d = new Date(a.dateTime);
      return d.getHours() * 60 + d.getMinutes();
    });

  const slots: string[] = [];

  for (const slot of barberSlots) {
    const slotStart = Math.max(timeToMinutes(slot.start), shopOpen);
    const slotEnd = Math.min(timeToMinutes(slot.end), shopClose);

    for (let t = slotStart; t + serviceDuration <= slotEnd; t += 30) {
      const isBooked = bookedTimes.some(
        (bt) => Math.abs(bt - t) < serviceDuration
      );
      if (!isBooked) {
        slots.push(minutesToTime(t));
      }
    }
  }

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + 30;
    return slots.filter((s) => timeToMinutes(s) >= currentMinutes);
  }

  return slots;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${month} ${day} at ${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
