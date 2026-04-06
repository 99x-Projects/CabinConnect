import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Cabin, MaintenanceRecord, OwnershipCost, VisitorInstructions, CostSummary, CostFrequency } from '@cabinconnect/shared';

export class CabinRepository {
  private db: SupabaseClient;

  constructor() {
    this.db = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // ── Cabins ──────────────────────────────────────────────

  async listByOwner(ownerId: string): Promise<Cabin[]> {
    const { data, error } = await this.db
      .from('cabins')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.toCabin);
  }

  async findById(id: string, ownerId: string): Promise<Cabin | null> {
    const { data, error } = await this.db
      .from('cabins')
      .select('*')
      .eq('id', id)
      .eq('owner_id', ownerId)
      .single();
    if (error || !data) return null;
    return this.toCabin(data);
  }

  async create(ownerId: string, input: Omit<Cabin, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>): Promise<Cabin> {
    const { data, error } = await this.db
      .from('cabins')
      .insert({
        owner_id: ownerId,
        name: input.name,
        address: input.address,
        location: input.location ? `POINT(${input.location.lng} ${input.location.lat})` : null,
        size_m2: input.sizeM2,
        year_built: input.yearBuilt,
        bedrooms: input.bedrooms,
        resort: input.resort,
      })
      .select()
      .single();
    if (error) throw error;
    return this.toCabin(data);
  }

  async update(id: string, ownerId: string, input: Partial<Omit<Cabin, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>>): Promise<Cabin> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) patch.name = input.name;
    if (input.address !== undefined) patch.address = input.address;
    if (input.sizeM2 !== undefined) patch.size_m2 = input.sizeM2;
    if (input.yearBuilt !== undefined) patch.year_built = input.yearBuilt;
    if (input.bedrooms !== undefined) patch.bedrooms = input.bedrooms;
    if (input.resort !== undefined) patch.resort = input.resort;
    if (input.location !== undefined) patch.location = `POINT(${input.location.lng} ${input.location.lat})`;

    const { data, error } = await this.db
      .from('cabins')
      .update(patch)
      .eq('id', id)
      .eq('owner_id', ownerId)
      .select()
      .single();
    if (error) throw error;
    return this.toCabin(data);
  }

  async delete(id: string, ownerId: string): Promise<void> {
    const { error } = await this.db
      .from('cabins')
      .delete()
      .eq('id', id)
      .eq('owner_id', ownerId);
    if (error) throw error;
  }

  // ── Maintenance ─────────────────────────────────────────

  async listMaintenance(cabinId: string): Promise<MaintenanceRecord[]> {
    const { data, error } = await this.db
      .from('maintenance_records')
      .select('*')
      .eq('cabin_id', cabinId)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.toMaintenance);
  }

  async addMaintenance(cabinId: string, input: Omit<MaintenanceRecord, 'id' | 'cabinId' | 'createdAt'>): Promise<MaintenanceRecord> {
    const { data, error } = await this.db
      .from('maintenance_records')
      .insert({
        cabin_id: cabinId,
        title: input.title,
        description: input.description,
        date: input.date,
        cost: input.cost,
        category: input.category,
        completed_by: input.completedBy,
        next_due_date: input.nextDueDate,
      })
      .select()
      .single();
    if (error) throw error;
    return this.toMaintenance(data);
  }

  async updateMaintenance(id: string, cabinId: string, input: Partial<Omit<MaintenanceRecord, 'id' | 'cabinId' | 'createdAt'>>): Promise<MaintenanceRecord> {
    const { data, error } = await this.db
      .from('maintenance_records')
      .update({
        ...(input.title && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.date && { date: input.date }),
        ...(input.cost !== undefined && { cost: input.cost }),
        ...(input.category && { category: input.category }),
        ...(input.completedBy !== undefined && { completed_by: input.completedBy }),
        ...(input.nextDueDate !== undefined && { next_due_date: input.nextDueDate }),
      })
      .eq('id', id)
      .eq('cabin_id', cabinId)
      .select()
      .single();
    if (error) throw error;
    return this.toMaintenance(data);
  }

  async deleteMaintenance(id: string, cabinId: string): Promise<void> {
    const { error } = await this.db
      .from('maintenance_records')
      .delete()
      .eq('id', id)
      .eq('cabin_id', cabinId);
    if (error) throw error;
  }

  // ── Ownership Costs ──────────────────────────────────────

  async listCosts(cabinId: string): Promise<OwnershipCost[]> {
    const { data, error } = await this.db
      .from('ownership_costs')
      .select('*')
      .eq('cabin_id', cabinId);
    if (error) throw error;
    return (data ?? []).map(this.toCost);
  }

  async addCost(cabinId: string, input: Omit<OwnershipCost, 'id' | 'cabinId' | 'createdAt'>): Promise<OwnershipCost> {
    const { data, error } = await this.db
      .from('ownership_costs')
      .insert({ cabin_id: cabinId, ...this.costToRow(input) })
      .select()
      .single();
    if (error) throw error;
    return this.toCost(data);
  }

  async deleteCost(id: string, cabinId: string): Promise<void> {
    const { error } = await this.db
      .from('ownership_costs')
      .delete()
      .eq('id', id)
      .eq('cabin_id', cabinId);
    if (error) throw error;
  }

  computeCostSummary(costs: OwnershipCost[]): CostSummary {
    const toMonthly = (amount: number, freq: CostFrequency): number => {
      const map: Record<CostFrequency, number> = {
        monthly: 1, quarterly: 1 / 3, annually: 1 / 12, one_time: 0,
      };
      return amount * (map[freq] ?? 0);
    };

    const breakdown = costs.map(c => ({
      label: c.label,
      monthly: toMonthly(c.amount, c.frequency),
    }));
    const monthlyTotal = breakdown.reduce((s, b) => s + b.monthly, 0);
    return {
      monthlyTotal: Math.round(monthlyTotal),
      annualTotal: Math.round(monthlyTotal * 12),
      currency: costs[0]?.currency ?? 'NOK',
      breakdown,
    };
  }

  // ── Visitor Instructions ─────────────────────────────────

  async getInstructions(cabinId: string): Promise<VisitorInstructions | null> {
    const { data, error } = await this.db
      .from('visitor_instructions')
      .select('*')
      .eq('cabin_id', cabinId)
      .single();
    if (error || !data) return null;
    return this.toInstructions(data, cabinId);
  }

  async upsertInstructions(cabinId: string, input: Omit<VisitorInstructions, 'id' | 'cabinId' | 'updatedAt'>): Promise<VisitorInstructions> {
    const { data, error } = await this.db
      .from('visitor_instructions')
      .upsert({
        cabin_id: cabinId,
        access_code: input.accessCode,
        wifi_name: input.wifiName,
        wifi_password: input.wifiPassword,
        parking_info: input.parkingInfo,
        house_rules: input.houseRules,
        emergency_contacts: input.emergencyContacts,
        check_in_info: input.checkInInfo,
        check_out_info: input.checkOutInfo,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'cabin_id' })
      .select()
      .single();
    if (error) throw error;
    return this.toInstructions(data, cabinId);
  }

  // ── Mappers ──────────────────────────────────────────────

  private toCabin(row: Record<string, unknown>): Cabin {
    return {
      id: row.id as string,
      ownerId: row.owner_id as string,
      name: row.name as string,
      address: row.address as string,
      sizeM2: row.size_m2 as number | undefined,
      yearBuilt: row.year_built as number | undefined,
      bedrooms: row.bedrooms as number | undefined,
      resort: row.resort as string | undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private toMaintenance(row: Record<string, unknown>): MaintenanceRecord {
    return {
      id: row.id as string,
      cabinId: row.cabin_id as string,
      title: row.title as string,
      description: row.description as string | undefined,
      date: row.date as string,
      cost: row.cost as number | undefined,
      category: row.category as MaintenanceRecord['category'],
      completedBy: row.completed_by as string | undefined,
      nextDueDate: row.next_due_date as string | undefined,
      createdAt: row.created_at as string,
    };
  }

  private toCost(row: Record<string, unknown>): OwnershipCost {
    return {
      id: row.id as string,
      cabinId: row.cabin_id as string,
      label: row.label as string,
      type: row.type as OwnershipCost['type'],
      amount: row.amount as number,
      currency: row.currency as string,
      frequency: row.frequency as OwnershipCost['frequency'],
      createdAt: row.created_at as string,
    };
  }

  private costToRow(c: Omit<OwnershipCost, 'id' | 'cabinId' | 'createdAt'>) {
    return { label: c.label, type: c.type, amount: c.amount, currency: c.currency, frequency: c.frequency };
  }

  private toInstructions(row: Record<string, unknown>, cabinId: string): VisitorInstructions {
    return {
      id: row.id as string,
      cabinId,
      accessCode: row.access_code as string | undefined,
      wifiName: row.wifi_name as string | undefined,
      wifiPassword: row.wifi_password as string | undefined,
      parkingInfo: row.parking_info as string | undefined,
      houseRules: row.house_rules as string | undefined,
      emergencyContacts: (row.emergency_contacts as VisitorInstructions['emergencyContacts']) ?? [],
      checkInInfo: row.check_in_info as string | undefined,
      checkOutInfo: row.check_out_info as string | undefined,
      updatedAt: row.updated_at as string,
    };
  }
}
