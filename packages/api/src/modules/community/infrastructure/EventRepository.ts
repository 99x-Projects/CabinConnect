import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { CabinEvent, EventRSVP, EventSearchParams, CreateEventInput, RSVPStatus, PaginatedResult } from '@cabinconnect/shared';

export class EventRepository {
  private db: SupabaseClient;

  constructor() {
    this.db = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async search(params: EventSearchParams): Promise<PaginatedResult<CabinEvent>> {
    const { page, limit, resort, category, from, to, status = 'published' } = params;
    const offset = (page - 1) * limit;

    let query = this.db
      .from('events')
      .select('*, profiles!organizer_id(display_name)', { count: 'exact' })
      .eq('status', status)
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (resort) query = query.eq('resort', resort);
    if (category) query = query.eq('category', category);
    if (from) query = query.gte('start_date', from);
    if (to) query = query.lte('start_date', to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data ?? []).map(this.toEvent), total: count ?? 0, page, limit };
  }

  async findById(id: string): Promise<CabinEvent | null> {
    const { data, error } = await this.db
      .from('events')
      .select('*, profiles!organizer_id(display_name)')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return this.toEvent(data);
  }

  async create(organizerId: string, input: CreateEventInput): Promise<CabinEvent> {
    const { data, error } = await this.db
      .from('events')
      .insert({
        title: input.title,
        description: input.description,
        location: input.location,
        geo_point: input.geoPoint ? `POINT(${input.geoPoint.lng} ${input.geoPoint.lat})` : null,
        start_date: input.startDate,
        end_date: input.endDate,
        organizer_id: organizerId,
        resort: input.resort,
        category: input.category,
        image_url: input.imageUrl,
        status: input.status ?? 'draft',
        max_attendees: input.maxAttendees,
      })
      .select('*, profiles!organizer_id(display_name)')
      .single();
    if (error) throw error;
    return this.toEvent(data);
  }

  async update(id: string, organizerId: string, input: Partial<CreateEventInput>): Promise<CabinEvent> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const fields: Array<keyof CreateEventInput> = ['title', 'description', 'location', 'startDate', 'endDate', 'resort', 'category', 'imageUrl', 'maxAttendees', 'status'];
    const colMap: Record<string, string> = { startDate: 'start_date', endDate: 'end_date', imageUrl: 'image_url', maxAttendees: 'max_attendees' };
    for (const f of fields) {
      if (input[f] !== undefined) patch[colMap[f] ?? f] = input[f];
    }
    const { data, error } = await this.db
      .from('events')
      .update(patch)
      .eq('id', id)
      .eq('organizer_id', organizerId)
      .select('*, profiles!organizer_id(display_name)')
      .single();
    if (error) throw error;
    return this.toEvent(data);
  }

  async setStatus(id: string, status: CabinEvent['status']): Promise<void> {
    const { error } = await this.db
      .from('events')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  async upsertRSVP(eventId: string, userId: string, status: RSVPStatus): Promise<EventRSVP> {
    const { data, error } = await this.db
      .from('event_rsvps')
      .upsert({ event_id: eventId, user_id: userId, status }, { onConflict: 'event_id,user_id' })
      .select()
      .single();
    if (error) throw error;
    return { id: data.id, eventId: data.event_id, userId: data.user_id, status: data.status, createdAt: data.created_at };
  }

  async removeRSVP(eventId: string, userId: string): Promise<void> {
    const { error } = await this.db
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
    if (error) throw error;
  }

  async getUserRSVP(eventId: string, userId: string): Promise<EventRSVP | null> {
    const { data } = await this.db
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();
    if (!data) return null;
    return { id: data.id, eventId: data.event_id, userId: data.user_id, status: data.status, createdAt: data.created_at };
  }

  private toEvent(row: Record<string, unknown>): CabinEvent {
    const profile = row.profiles as { display_name?: string } | null;
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      location: row.location as string,
      startDate: row.start_date as string,
      endDate: row.end_date as string,
      organizerId: row.organizer_id as string,
      organizerName: profile?.display_name ?? 'Unknown',
      resort: row.resort as string | undefined,
      category: row.category as CabinEvent['category'],
      imageUrl: row.image_url as string | undefined,
      status: row.status as CabinEvent['status'],
      maxAttendees: row.max_attendees as number | undefined,
      attendeeCount: row.attendee_count as number,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}
