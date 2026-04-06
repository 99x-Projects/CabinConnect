import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Review, SupplierReply } from '@cabinconnect/shared';

export class ReviewRepository {
  private db: SupabaseClient;

  constructor() {
    this.db = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async create(input: Omit<Review, 'id' | 'createdAt' | 'reply'>): Promise<Review> {
    const { data, error } = await this.db
      .from('supplier_reviews')
      .insert({
        supplier_id: input.supplierId,
        user_id: input.userId,
        rating: input.rating,
        comment: input.comment,
        job_date: input.jobDate,
      })
      .select()
      .single();
    if (error) throw error;
    return data as Review;
  }

  async addReply(reviewId: string, supplierId: string, comment: string): Promise<SupplierReply> {
    const { data, error } = await this.db
      .from('supplier_replies')
      .insert({ review_id: reviewId, supplier_id: supplierId, comment })
      .select()
      .single();
    if (error) throw error;
    return data as SupplierReply;
  }

  async hasReviewed(supplierId: string, userId: string): Promise<boolean> {
    const { count } = await this.db
      .from('supplier_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('supplier_id', supplierId)
      .eq('user_id', userId);
    return (count ?? 0) > 0;
  }
}
