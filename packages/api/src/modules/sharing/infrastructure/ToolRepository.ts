import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Tool, BorrowRequest, ToolSearchParams, BorrowStatus } from '@cabinconnect/shared';

export class ToolRepository {
  private db: SupabaseClient;

  constructor() {
    this.db = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // ── Tools ────────────────────────────────────────────────

  async search(params: ToolSearchParams): Promise<{ data: Tool[]; total: number }> {
    const offset = (params.page - 1) * params.limit;
    let query = this.db
      .from('tools')
      .select('*, profiles!owner_id(display_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + params.limit - 1);

    if (params.availableOnly !== false) query = query.eq('available', true);
    if (params.category) query = query.eq('category', params.category);
    if (params.resort) query = query.eq('resort', params.resort);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data ?? []).map(this.toTool), total: count ?? 0 };
  }

  async findById(id: string): Promise<Tool | null> {
    const { data, error } = await this.db
      .from('tools')
      .select('*, profiles!owner_id(display_name)')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return this.toTool(data);
  }

  async listByOwner(ownerId: string): Promise<Tool[]> {
    const { data, error } = await this.db
      .from('tools')
      .select('*, profiles!owner_id(display_name)')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.toTool);
  }

  async create(ownerId: string, input: Omit<Tool, 'id' | 'ownerId' | 'ownerName' | 'available' | 'createdAt' | 'updatedAt'>): Promise<Tool> {
    const { data, error } = await this.db
      .from('tools')
      .insert({
        owner_id: ownerId,
        name: input.name,
        description: input.description,
        category: input.category,
        condition: input.condition,
        photos: input.photos,
        resort: input.resort,
        price_per_day: input.pricePerDay,
        currency: input.currency ?? 'NOK',
      })
      .select('*, profiles!owner_id(display_name)')
      .single();
    if (error) throw error;
    return this.toTool(data);
  }

  async update(id: string, ownerId: string, input: Partial<Tool>): Promise<Tool> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) patch.name = input.name;
    if (input.description !== undefined) patch.description = input.description;
    if (input.category !== undefined) patch.category = input.category;
    if (input.condition !== undefined) patch.condition = input.condition;
    if (input.resort !== undefined) patch.resort = input.resort;
    if (input.pricePerDay !== undefined) patch.price_per_day = input.pricePerDay;
    if (input.available !== undefined) patch.available = input.available;

    const { data, error } = await this.db
      .from('tools')
      .update(patch)
      .eq('id', id)
      .eq('owner_id', ownerId)
      .select('*, profiles!owner_id(display_name)')
      .single();
    if (error) throw error;
    return this.toTool(data);
  }

  async delete(id: string, ownerId: string): Promise<void> {
    const { error } = await this.db.from('tools').delete().eq('id', id).eq('owner_id', ownerId);
    if (error) throw error;
  }

  // ── Borrow Requests ──────────────────────────────────────

  async createRequest(input: Omit<BorrowRequest, 'id' | 'toolName' | 'requesterName' | 'createdAt'>): Promise<BorrowRequest> {
    const { data, error } = await this.db
      .from('borrow_requests')
      .insert({
        tool_id: input.toolId,
        requester_id: input.requesterId,
        owner_id: input.ownerId,
        start_date: input.startDate,
        end_date: input.endDate,
        message: input.message,
      })
      .select('*, tools(name), profiles!requester_id(display_name)')
      .single();
    if (error) throw error;
    return this.toRequest(data);
  }

  async listRequestsForOwner(ownerId: string): Promise<BorrowRequest[]> {
    const { data, error } = await this.db
      .from('borrow_requests')
      .select('*, tools(name), profiles!requester_id(display_name)')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.toRequest);
  }

  async listRequestsByRequester(requesterId: string): Promise<BorrowRequest[]> {
    const { data, error } = await this.db
      .from('borrow_requests')
      .select('*, tools(name), profiles!requester_id(display_name)')
      .eq('requester_id', requesterId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.toRequest);
  }

  async updateRequestStatus(id: string, ownerId: string, status: BorrowStatus): Promise<void> {
    const { error } = await this.db
      .from('borrow_requests')
      .update({ status })
      .eq('id', id)
      .eq('owner_id', ownerId);
    if (error) throw error;
  }

  // ── Mappers ──────────────────────────────────────────────

  private toTool(row: Record<string, unknown>): Tool {
    const profile = row.profiles as { display_name?: string } | null;
    return {
      id: row.id as string,
      ownerId: row.owner_id as string,
      ownerName: profile?.display_name ?? 'Unknown',
      name: row.name as string,
      description: row.description as string | undefined,
      category: row.category as Tool['category'],
      condition: row.condition as Tool['condition'],
      photos: (row.photos as string[]) ?? [],
      resort: row.resort as string | undefined,
      available: row.available as boolean,
      pricePerDay: row.price_per_day as number | undefined,
      currency: (row.currency as string) ?? 'NOK',
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private toRequest(row: Record<string, unknown>): BorrowRequest {
    const tool = row.tools as { name?: string } | null;
    const profile = row.profiles as { display_name?: string } | null;
    return {
      id: row.id as string,
      toolId: row.tool_id as string,
      toolName: tool?.name ?? '',
      requesterId: row.requester_id as string,
      requesterName: profile?.display_name ?? 'Unknown',
      ownerId: row.owner_id as string,
      startDate: row.start_date as string,
      endDate: row.end_date as string,
      message: row.message as string | undefined,
      status: row.status as BorrowStatus,
      createdAt: row.created_at as string,
    };
  }
}
