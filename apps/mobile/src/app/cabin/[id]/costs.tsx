import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCabinDetail } from '../../../hooks/useCabin';
import type { CostType, CostFrequency, OwnershipCost } from '@cabinconnect/shared';

const COST_TYPES: CostType[] = [
  'mortgage', 'insurance', 'property_tax', 'utilities', 'maintenance_budget', 'association_fee', 'other',
];

const FREQUENCIES: CostFrequency[] = ['monthly', 'quarterly', 'annually', 'one_time'];

const FREQ_MULTIPLIER: Record<CostFrequency, number> = {
  monthly: 1,
  quarterly: 1 / 3,
  annually: 1 / 12,
  one_time: 0,
};

function toMonthly(amount: number, freq: CostFrequency): number {
  return Math.round(amount * (FREQ_MULTIPLIER[freq] ?? 0));
}

export default function CostsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { costs, costSummary, addMaintenance } = useCabinDetail(id);
  // We reuse useCabinDetail but need addCost — wire via direct fetch for now
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: '',
    type: 'other' as CostType,
    amount: '',
    frequency: 'monthly' as CostFrequency,
    currency: 'NOK',
  });
  const [localCosts, setLocalCosts] = useState<OwnershipCost[] | null>(null);

  const displayCosts = localCosts ?? costs;

  async function handleAdd() {
    if (!form.label || !form.amount) return;
    const { supabase } = await import('../../../lib/supabase');
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/api/v1/cabins/${id}/costs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ label: form.label, type: form.type, amount: Number(form.amount), frequency: form.frequency, currency: form.currency }),
    });
    if (res.ok) {
      const json = await res.json();
      setLocalCosts(prev => [...(prev ?? costs), json.data]);
      setShowForm(false);
      setForm({ label: '', type: 'other', amount: '', frequency: 'monthly', currency: 'NOK' });
    }
  }

  async function handleDelete(costId: string) {
    const { supabase } = await import('../../../lib/supabase');
    const { data: session } = await supabase.auth.getSession();
    const token = session.session?.access_token;
    const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
    await fetch(`${apiUrl}/api/v1/cabins/${id}/costs/${costId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setLocalCosts(prev => (prev ?? costs).filter(c => c.id !== costId));
  }

  const monthlyTotal = displayCosts.reduce((s, c) => s + toMonthly(c.amount, c.frequency), 0);
  const annualTotal = monthlyTotal * 12;

  return (
    <View style={styles.container}>
      {/* Summary banner */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t('cabin.costs.monthly')}</Text>
          <Text style={styles.summaryAmount}>{monthlyTotal.toLocaleString()} NOK</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t('cabin.costs.annually')}</Text>
          <Text style={styles.summaryAmount}>{annualTotal.toLocaleString()} NOK</Text>
        </View>
      </View>

      <FlatList
        data={displayCosts}
        keyExtractor={c => c.id}
        ListEmptyComponent={<Text style={styles.empty}>{t('cabin.costs.empty')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardType}>{t(`cabin.costs.types.${item.type}`)}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardAmount}>{item.amount.toLocaleString()} {item.currency}</Text>
                <Text style={styles.cardFreq}>/ {t(`cabin.costs.frequencies.${item.frequency}`)}</Text>
                <Text style={styles.cardMonthly}>≈ {toMonthly(item.amount, item.frequency).toLocaleString()} / {t('cabin.costs.mo')}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteBtnText}>{t('common.delete')}</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('cabin.costs.add')}</Text>

          <Text style={styles.fieldLabel}>{t('cabin.costs.label')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('cabin.costs.labelPlaceholder')}
            value={form.label}
            onChangeText={v => setForm(p => ({ ...p, label: v }))}
          />

          <Text style={styles.fieldLabel}>{t('cabin.costs.amount')}</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={form.amount}
            onChangeText={v => setForm(p => ({ ...p, amount: v }))}
            keyboardType="numeric"
          />

          <Text style={styles.fieldLabel}>{t('cabin.costs.type')}</Text>
          <View style={styles.chips}>
            {COST_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, form.type === type && styles.chipActive]}
                onPress={() => setForm(p => ({ ...p, type }))}
              >
                <Text style={[styles.chipText, form.type === type && styles.chipTextActive]}>
                  {t(`cabin.costs.types.${type}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>{t('cabin.costs.frequency')}</Text>
          <View style={styles.chips}>
            {FREQUENCIES.map(freq => (
              <TouchableOpacity
                key={freq}
                style={[styles.chip, form.frequency === freq && styles.chipActive]}
                onPress={() => setForm(p => ({ ...p, frequency: freq }))}
              >
                <Text style={[styles.chipText, form.frequency === freq && styles.chipTextActive]}>
                  {t(`cabin.costs.frequencies.${freq}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
            <Text style={styles.saveBtnText}>{t('common.save')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
            <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  summary: { flexDirection: 'row', backgroundColor: '#2563eb', padding: 20 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 },
  summaryAmount: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 4 },
  list: { padding: 16, gap: 10 },
  empty: { textAlign: 'center', color: '#888', marginTop: 48 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLeft: { flex: 1 },
  cardLabel: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  cardType: { color: '#888', fontSize: 13 },
  cardRight: { alignItems: 'flex-end' },
  cardAmount: { fontSize: 16, fontWeight: '700', color: '#111' },
  cardFreq: { color: '#888', fontSize: 12 },
  cardMonthly: { color: '#16a34a', fontSize: 12, marginTop: 2 },
  deleteBtn: { marginTop: 10, alignSelf: 'flex-end' },
  deleteBtnText: { color: '#dc2626', fontSize: 13 },
  fab: { position: 'absolute', right: 20, bottom: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  modal: { flex: 1 },
  modalContent: { padding: 24 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  fieldLabel: { fontWeight: '600', marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: '#fff' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#444' },
  chipTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 16 },
});
