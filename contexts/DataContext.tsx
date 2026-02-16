import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Barber, Service, Appointment, Shop, ShopHours, AppointmentStatus, WeeklyAvailability, DateOverrides, BarberPrices, BarberSpecialtyTag } from '@/types';
import { DEMO_BARBERS, DEMO_SERVICES, DEMO_APPOINTMENTS, DEMO_SHOPS, DEFAULT_SHOP_HOURS } from '@/mocks/data';

const SHOPS_KEY = 'cutflow_shops';
const BARBERS_KEY = 'cutflow_barbers';
const SERVICES_KEY = 'cutflow_services';
const APPTS_KEY = 'cutflow_appointments';

export const [DataProvider, useData] = createContextHook(() => {
  const [shops, setShops] = useState<Shop[]>(DEMO_SHOPS);
  const [barbers, setBarbers] = useState<Barber[]>(DEMO_BARBERS);
  const [services, setServices] = useState<Service[]>(DEMO_SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>(DEMO_APPOINTMENTS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sh, b, s, a] = await Promise.all([
        AsyncStorage.getItem(SHOPS_KEY),
        AsyncStorage.getItem(BARBERS_KEY),
        AsyncStorage.getItem(SERVICES_KEY),
        AsyncStorage.getItem(APPTS_KEY),
      ]);
      if (sh) setShops(JSON.parse(sh));
      if (b) setBarbers(JSON.parse(b));
      if (s) setServices(JSON.parse(s));
      if (a) setAppointments(JSON.parse(a));
    } catch (e) {
      console.log('Error loading data:', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const persist = useCallback(async (key: string, data: unknown) => {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }, []);

  const addShop = useCallback(async (shop: Shop) => {
    const updated = [...shops, shop];
    setShops(updated);
    await persist(SHOPS_KEY, updated);
  }, [shops, persist]);

  const getShopById = useCallback((id: string) => shops.find((s) => s.id === id), [shops]);

  const getShopByOwnerId = useCallback((ownerId: string) => shops.find((s) => s.ownerId === ownerId), [shops]);

  const getShopBarbers = useCallback((shopId: string) => barbers.filter((b) => b.shopId === shopId), [barbers]);

  const getShopServices = useCallback((shopId: string) => services.filter((s) => s.shopId === shopId), [services]);

  const getShopAppointments = useCallback((shopId: string) => appointments.filter((a) => a.shopId === shopId), [appointments]);

  const addBarber = useCallback(async (barber: Barber) => {
    const updated = [...barbers, barber];
    setBarbers(updated);
    await persist(BARBERS_KEY, updated);
  }, [barbers, persist]);

  const removeBarber = useCallback(async (id: string) => {
    const updated = barbers.filter((b) => b.id !== id);
    setBarbers(updated);
    await persist(BARBERS_KEY, updated);
  }, [barbers, persist]);

  const updateBarberAvailability = useCallback(async (barberId: string, availability: WeeklyAvailability) => {
    const updated = barbers.map((b) =>
      b.id === barberId ? { ...b, availability } : b
    );
    setBarbers(updated);
    await persist(BARBERS_KEY, updated);
  }, [barbers, persist]);

  const updateBarberDateOverrides = useCallback(async (barberId: string, dateOverrides: DateOverrides) => {
    const updated = barbers.map((b) =>
      b.id === barberId ? { ...b, dateOverrides } : b
    );
    setBarbers(updated);
    await persist(BARBERS_KEY, updated);
  }, [barbers, persist]);

  const updateBarberPrices = useCallback(async (barberId: string, prices: BarberPrices) => {
    const updated = barbers.map((b) =>
      b.id === barberId ? { ...b, prices } : b
    );
    setBarbers(updated);
    await persist(BARBERS_KEY, updated);
  }, [barbers, persist]);

  const updateBarberProfile = useCallback(async (
    barberId: string,
    profile: {
      name?: string;
      bio?: string;
      instagram?: string;
      yearsExperience?: number;
      specialtyTags?: BarberSpecialtyTag[];
      avatar?: string;
    }
  ) => {
    const updated = barbers.map((b) =>
      b.id === barberId ? { ...b, ...profile } : b
    );
    setBarbers(updated);
    await persist(BARBERS_KEY, updated);
  }, [barbers, persist]);

  const inviteBarber = useCallback(async (email: string, shopId: string) => {
    const newBarber: Barber = {
      id: `barber-${Date.now()}`,
      userId: '',
      shopId,
      name: email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=C8956C&color=0A0A0A&size=200`,
      specialty: 'New Barber',
      specialtyTags: [],
      bio: '',
      instagram: '',
      yearsExperience: 0,
      availability: {
        monday: [{ start: '09:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '17:00' }],
        saturday: [{ start: '10:00', end: '15:00' }],
        sunday: [],
      },
      inviteStatus: 'pending',
      inviteEmail: email,
    };
    const updated = [...barbers, newBarber];
    setBarbers(updated);
    await persist(BARBERS_KEY, updated);
    return newBarber;
  }, [barbers, persist]);

  const getBarberPrice = useCallback((barberId: string, serviceId: string): number => {
    const barber = barbers.find((b) => b.id === barberId);
    const service = services.find((s) => s.id === serviceId);
    if (barber?.prices?.[serviceId] !== undefined) {
      return barber.prices[serviceId];
    }
    return service?.price ?? 0;
  }, [barbers, services]);

  const addService = useCallback(async (service: Service) => {
    const updated = [...services, service];
    setServices(updated);
    await persist(SERVICES_KEY, updated);
  }, [services, persist]);

  const removeService = useCallback(async (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
    await persist(SERVICES_KEY, updated);
  }, [services, persist]);

  const addAppointment = useCallback(async (appt: Appointment) => {
    const updated = [...appointments, appt];
    setAppointments(updated);
    await persist(APPTS_KEY, updated);
  }, [appointments, persist]);

  const updateAppointmentStatus = useCallback(async (id: string, status: AppointmentStatus) => {
    const updated = appointments.map((a) =>
      a.id === id ? { ...a, status } : a
    );
    setAppointments(updated);
    await persist(APPTS_KEY, updated);
  }, [appointments, persist]);

  const rescheduleAppointment = useCallback(async (id: string, newDateTime: string) => {
    const updated = appointments.map((a) =>
      a.id === id ? { ...a, dateTime: newDateTime } : a
    );
    setAppointments(updated);
    await persist(APPTS_KEY, updated);
  }, [appointments, persist]);

  const updateShopHours = useCallback(async (shopId: string, hours: ShopHours) => {
    const updated = shops.map((s) =>
      s.id === shopId ? { ...s, hours } : s
    );
    setShops(updated);
    await persist(SHOPS_KEY, updated);
  }, [shops, persist]);

  const getBarberById = useCallback((id: string) => barbers.find((b) => b.id === id), [barbers]);
  const getServiceById = useCallback((id: string) => services.find((s) => s.id === id), [services]);
  const getBarberByUserId = useCallback((userId: string) => barbers.find((b) => b.userId === userId), [barbers]);

  const getBarberAppointments = useCallback(
    (barberId: string) => appointments.filter((a) => a.barberId === barberId),
    [appointments]
  );

  const getCustomerAppointments = useCallback(
    (customerId: string) => appointments.filter((a) => a.customerId === customerId),
    [appointments]
  );

  return {
    shops,
    barbers,
    services,
    appointments,
    isLoaded,
    addShop,
    getShopById,
    getShopByOwnerId,
    getShopBarbers,
    getShopServices,
    getShopAppointments,
    addBarber,
    removeBarber,
    updateBarberAvailability,
    updateBarberDateOverrides,
    updateBarberPrices,
    updateBarberProfile,
    inviteBarber,
    getBarberPrice,
    addService,
    removeService,
    addAppointment,
    updateAppointmentStatus,
    rescheduleAppointment,
    updateShopHours,
    getBarberById,
    getServiceById,
    getBarberByUserId,
    getBarberAppointments,
    getCustomerAppointments,
  };
});
