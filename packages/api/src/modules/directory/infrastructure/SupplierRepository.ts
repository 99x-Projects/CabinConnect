import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { SupplierSearchParams, Supplier as SupplierType, PaginatedResult } from '@cabinconnect/shared';

export class SupplierRepository {
  private db: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    this.db = createClient(url, key);
  }

  async search(params: SupplierSearchParams): Promise<PaginatedResult<SupplierType>> {
    const { page, limit, category, resort, lat, lng, radiusKm } = params;
    const from = (page - 1) * limit;

    let query = this.db
      .from('suppliers')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .range(from, from + limit - 1);

    if (category) {
      query = query.contains('categories', [category]);
    }

    if (resort) {
      query = query.contains('service_areas', [resort]);
    }

    // Geo filter: handled via PostGIS RPC for proximity
    if (lat !== undefined && lng !== undefined && radiusKm) {
      const { data, error } = await this.db.rpc('suppliers_within_radius', {
        lat, lng, radius_km: radiusKm,
      });
      if (error) throw error;
      return { data: data ?? [], total: data?.length ?? 0, page, limit };
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data ?? []) as SupplierType[], total: count ?? 0, page, limit };
  }

  async findById(id: string): Promise<SupplierType | null> {
    const { data, error } = await this.db
      .from('suppliers')
      .select('*, supplier_reviews(*, supplier_replies(*))')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as SupplierType;
  }

  async create(input: Omit<SupplierType, 'id' | 'averageRating' | 'reviewCount' | 'createdAt' | 'updatedAt'>): Promise<SupplierType> {
    const { data, error } = await this.db
      .from('suppliers')
      .insert({
        name: input.name,
        categories: input.categories,
        service_areas: input.serviceAreas,
        location: `POINT(${input.location.lng} ${input.location.lat})`,
        phone: input.phone,
        email: input.email,
        website: input.website,
        description: input.description,
        photos: input.photos,
        nominated_by: input.nominatedBy,
        status: 'pending',
      })
      .select()
      .single();
    if (error) throw error;
    return data as SupplierType;
  }

  async updateStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const { error } = await this.db
      .from('suppliers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  async claim(id: string, userId: string): Promise<void> {
    const { error } = await this.db
      .from('suppliers')
      .update({ claimed_by: userId, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('claimed_by', null);
    if (error) throw error;
  }
}
