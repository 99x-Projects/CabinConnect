import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { UserProfile, UpdateProfileInput } from '@cabinconnect/shared';

export class UserRepository {
  private db: SupabaseClient;

  constructor() {
    this.db = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async findById(id: string): Promise<UserProfile | null> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return this.toProfile(data, id);
  }

  async upsert(id: string, email: string): Promise<UserProfile> {
    const { data, error } = await this.db
      .from('profiles')
      .upsert({ id, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return this.toProfile(data, id, email);
  }

  async update(id: string, input: UpdateProfileInput): Promise<UserProfile> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.displayName !== undefined) patch.display_name = input.displayName;
    if (input.locale !== undefined) patch.locale = input.locale;

    const { data, error } = await this.db
      .from('profiles')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return this.toProfile(data, id);
  }

  async setRole(id: string, role: 'user' | 'supplier' | 'admin'): Promise<void> {
    const { error } = await this.db
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  private toProfile(row: Record<string, unknown>, id: string, email?: string): UserProfile {
    return {
      id,
      displayName: (row.display_name as string) ?? '',
      email: email ?? '',
      role: (row.role as UserProfile['role']) ?? 'user',
      locale: (row.locale as UserProfile['locale']) ?? 'no',
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}
