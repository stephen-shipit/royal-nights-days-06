import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Reservation {
  table_id: string;
  status: string;
  guest_name?: string;
  guest_count?: number;
}

export function useTableAvailability(
  reservationType: 'dining' | 'nightlife',
  selectedDate?: string,
  eventId?: string
) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reservationType === 'dining' && selectedDate) {
      loadDiningReservations(selectedDate);
    } else if (reservationType === 'nightlife' && eventId) {
      loadNightlifeReservations(eventId);
    } else {
      setReservations([]);
    }
  }, [reservationType, selectedDate, eventId]);

  const loadDiningReservations = async (date: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('table_reservations')
        .select('table_id, status, guest_name, guest_count')
        .eq('reservation_type', 'dining')
        .gte('created_at', `${date} 00:00:00`)
        .lte('created_at', `${date} 23:59:59`)
        .in('status', ['confirmed', 'pending']);

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error loading dining reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadNightlifeReservations = async (eventId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('table_reservations')
        .select('table_id, status, guest_name, guest_count')
        .eq('event_id', eventId)
        .in('status', ['confirmed', 'pending']);

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error loading nightlife reservations:', error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  return { reservations, loading };
}