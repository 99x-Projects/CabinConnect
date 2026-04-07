import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { GroceryOrder, OrderItem, OrderStatus } from '@cabinconnect/shared';

export class GroceryRepository {
  private db: SupabaseClient;

  constructor() {
    this.db = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  private toOrder(row: Record<string, unknown>): GroceryOrder {
    const userProfile = row.user_profile as { display_name?: string } | null;
    const volunteerProfile = row.volunteer_profile as { display_name?: string } | null;
    return {
      id: row.id as string,
      userId: row.user_id as string,
      userName: userProfile?.display_name ?? 'Unknown',
      cabinId: row.cabin_id as string | undefined,
      items: (row.items as OrderItem[]) ?? [],
      supermarket: row.supermarket as string,
      deliveryAddress: row.delivery_address as string,
      pickupDeadline: row.pickup_deadline as string,
      notes: row.notes as string | undefined,
      status: row.status as OrderStatus,
      volunteerId: row.volunteer_id as string | undefined,
      volunteerName: volunteerProfile?.display_name,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  async listByUser(userId: string): Promise<GroceryOrder[]> {
    const { data, error } = await this.db
      .from('grocery_orders')
      .select('*, user_profile:profiles!user_id(display_name), volunteer_profile:profiles!volunteer_id(display_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.toOrder);
  }

  async listAvailableForVolunteers(): Promise<GroceryOrder[]> {
    // Auto-expire before fetching
    try { await this.db.rpc('expire_undelivered_orders'); } catch { /* best-effort */ }

    const { data, error } = await this.db
      .from('grocery_orders')
      .select('*, user_profile:profiles!user_id(display_name), volunteer_profile:profiles!volunteer_id(display_name)')
      .eq('status', 'submitted')
      .gt('pickup_deadline', new Date().toISOString())
      .order('pickup_deadline', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(this.toOrder);
  }

  async findById(id: string): Promise<GroceryOrder | null> {
    const { data, error } = await this.db
      .from('grocery_orders')
      .select('*, user_profile:profiles!user_id(display_name), volunteer_profile:profiles!volunteer_id(display_name)')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return this.toOrder(data as unknown as Record<string, unknown>);
  }

  async create(userId: string, input: Omit<GroceryOrder, 'id' | 'userId' | 'userName' | 'status' | 'volunteerId' | 'volunteerName' | 'createdAt' | 'updatedAt'>): Promise<GroceryOrder> {
    const { data, error } = await this.db
      .from('grocery_orders')
      .insert({
        user_id: userId,
        cabin_id: input.cabinId,
        items: input.items,
        supermarket: input.supermarket,
        delivery_address: input.deliveryAddress,
        pickup_deadline: input.pickupDeadline,
        notes: input.notes,
        status: 'draft',
      })
      .select('*, user_profile:profiles!user_id(display_name), volunteer_profile:profiles!volunteer_id(display_name)')
      .single();
    if (error) throw error;
    return this.toOrder(data as unknown as Record<string, unknown>);
  }

  async updateItems(id: string, userId: string, items: OrderItem[]): Promise<GroceryOrder> {
    const { data, error } = await this.db
      .from('grocery_orders')
      .update({ items, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'draft') // only editable in draft
      .select('*, user_profile:profiles!user_id(display_name), volunteer_profile:profiles!volunteer_id(display_name)')
      .single();
    if (error) throw error;
    return this.toOrder(data as unknown as Record<string, unknown>);
  }

  async submit(id: string, userId: string): Promise<GroceryOrder> {
    const { data, error } = await this.db
      .from('grocery_orders')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'draft')
      .select('*, user_profile:profiles!user_id(display_name), volunteer_profile:profiles!volunteer_id(display_name)')
      .single();
    if (error) throw error;
    return this.toOrder(data as unknown as Record<string, unknown>);
  }

  async acceptAsVolunteer(id: string, volunteerId: string): Promise<GroceryOrder> {
    const { data, error } = await this.db
      .from('grocery_orders')
      .update({ status: 'volunteer_found', volunteer_id: volunteerId, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'submitted')
      .select('*, user_profile:profiles!user_id(display_name), volunteer_profile:profiles!volunteer_id(display_name)')
      .single();
    if (error) throw error;
    return this.toOrder(data as unknown as Record<string, unknown>);
  }

  async updateStatus(id: string, volunteerId: string, status: 'out_for_delivery' | 'delivered'): Promise<void> {
    const { error } = await this.db
      .from('grocery_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('volunteer_id', volunteerId);
    if (error) throw error;
  }

  async cancel(id: string, userId: string): Promise<void> {
    const { error } = await this.db
      .from('grocery_orders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .in('status', ['draft', 'submitted']);
    if (error) throw error;
  }
}
