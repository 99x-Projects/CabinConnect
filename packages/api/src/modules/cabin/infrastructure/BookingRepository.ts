import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AvailabilityWindow, CabinBooking, CabinInvite } from '@cabinconnect/shared';

export class BookingRepository {
  private db: SupabaseClient;

  constructor() {
    this.db = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // ── Availability Windows ────────────────────────────────────

  async listAvailability(cabinId: string): Promise<AvailabilityWindow[]> {
    const { data, error } = await this.db
      .from('cabin_availability')
      .select('*')
      .eq('cabin_id', cabinId)
      .order('start_date', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(this.toWindow);
  }

  async createWindow(cabinId: string, input: { startDate: string; endDate: string; notes?: string }): Promise<AvailabilityWindow> {
    const { data, error } = await this.db
      .from('cabin_availability')
      .insert({ cabin_id: cabinId, start_date: input.startDate, end_date: input.endDate, notes: input.notes })
      .select()
      .single();
    if (error) throw error;
    return this.toWindow(data);
  }

  async deleteWindow(id: string, cabinId: string): Promise<void> {
    const { error } = await this.db
      .from('cabin_availability')
      .delete()
      .eq('id', id)
      .eq('cabin_id', cabinId);
    if (error) throw error;
  }

  // ── Bookings ────────────────────────────────────────────────

  async listBookings(cabinId: string): Promise<CabinBooking[]> {
    const { data, error } = await this.db
      .from('cabin_bookings')
      .select('*, profile:profiles!user_id(display_name)')
      .eq('cabin_id', cabinId)
      .neq('status', 'cancelled')
      .order('start_date', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(this.toBooking);
  }

  async createBooking(
    cabinId: string,
    userId: string,
    input: { startDate: string; endDate: string; notes?: string }
  ): Promise<CabinBooking> {
    // Check no overlap with existing confirmed bookings
    const { data: conflicts } = await this.db
      .from('cabin_bookings')
      .select('id')
      .eq('cabin_id', cabinId)
      .eq('status', 'confirmed')
      .lte('start_date', input.endDate)
      .gte('end_date', input.startDate);
    if (conflicts && conflicts.length > 0) {
      throw new Error('Dates overlap with an existing booking');
    }

    // Check dates fall within an availability window
    const { data: windows } = await this.db
      .from('cabin_availability')
      .select('id')
      .eq('cabin_id', cabinId)
      .lte('start_date', input.startDate)
      .gte('end_date', input.endDate);
    if (!windows || windows.length === 0) {
      throw new Error('Dates are not within an available window');
    }

    const { data, error } = await this.db
      .from('cabin_bookings')
      .insert({ cabin_id: cabinId, user_id: userId, start_date: input.startDate, end_date: input.endDate, notes: input.notes })
      .select('*, profile:profiles!user_id(display_name)')
      .single();
    if (error) throw error;
    return this.toBooking(data);
  }

  async cancelBooking(id: string, requesterId: string, isOwner: boolean): Promise<void> {
    const query = this.db
      .from('cabin_bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (!isOwner) query.eq('user_id', requesterId);

    const { error } = await query;
    if (error) throw error;
  }

  // ── Invites ─────────────────────────────────────────────────

  async listInvites(cabinId: string): Promise<CabinInvite[]> {
    const { data, error } = await this.db
      .from('cabin_invites')
      .select('*, profile:profiles!invited_user_id(display_name)')
      .eq('cabin_id', cabinId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.toInvite);
  }

  async createInvite(cabinId: string, invitedBy: string, email: string): Promise<CabinInvite> {
    // Try to resolve user_id from email
    const { data: profile } = await this.db
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    const { data, error } = await this.db
      .from('cabin_invites')
      .insert({ cabin_id: cabinId, invited_by: invitedBy, invited_email: email, invited_user_id: profile?.id ?? null })
      .select('*, profile:profiles!invited_user_id(display_name)')
      .single();
    if (error) throw error;
    return this.toInvite(data);
  }

  async deleteInvite(id: string, cabinId: string): Promise<void> {
    const { error } = await this.db
      .from('cabin_invites')
      .delete()
      .eq('id', id)
      .eq('cabin_id', cabinId);
    if (error) throw error;
  }

  async isInvited(cabinId: string, email: string): Promise<boolean> {
    const { data } = await this.db
      .from('cabin_invites')
      .select('id')
      .eq('cabin_id', cabinId)
      .eq('invited_email', email)
      .maybeSingle();
    return !!data;
  }

  async isOwner(cabinId: string, userId: string): Promise<boolean> {
    const { data } = await this.db
      .from('cabins')
      .select('id')
      .eq('id', cabinId)
      .eq('owner_id', userId)
      .maybeSingle();
    return !!data;
  }

  // ── Mappers ─────────────────────────────────────────────────

  private toWindow(row: Record<string, unknown>): AvailabilityWindow {
    return {
      id: row.id as string,
      cabinId: row.cabin_id as string,
      startDate: row.start_date as string,
      endDate: row.end_date as string,
      notes: row.notes as string | undefined,
      createdAt: row.created_at as string,
    };
  }

  private toBooking(row: Record<string, unknown>): CabinBooking {
    const profile = row.profile as { display_name?: string } | null;
    return {
      id: row.id as string,
      cabinId: row.cabin_id as string,
      userId: row.user_id as string,
      userName: profile?.display_name ?? 'Unknown',
      startDate: row.start_date as string,
      endDate: row.end_date as string,
      notes: row.notes as string | undefined,
      status: row.status as 'confirmed' | 'cancelled',
      createdAt: row.created_at as string,
    };
  }

  private toInvite(row: Record<string, unknown>): CabinInvite {
    const profile = row.profile as { display_name?: string } | null;
    return {
      id: row.id as string,
      cabinId: row.cabin_id as string,
      invitedEmail: row.invited_email as string,
      invitedUserId: row.invited_user_id as string | undefined,
      invitedUserName: profile?.display_name,
      invitedBy: row.invited_by as string,
      createdAt: row.created_at as string,
    };
  }
}
