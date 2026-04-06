import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMyOrders } from '../../hooks/useGroceries';
import type { OrderItem } from '@cabinconnect/shared';

const UNITS = ['pcs', 'kg', 'g', 'l', 'dl', 'pkg'];

export default function NewOrderScreen() {
  const { t } = useTranslation();
  const { createOrder } = useMyOrders();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [form, setForm] = useState({ supermarket: 'RIMA', deliveryAddress: '', pickupDeadline: '', notes: '' });
  const [newItem, setNewItem] = useState({ name: '', quantity: '1', unit: 'pcs', notes: '' });

  function addItem() {
    if (!newItem.name) return;
    setItems(prev => [...prev, { name: newItem.name, quantity: Number(newItem.quantity) || 1, unit: newItem.unit, notes: newItem.notes || undefined }]);
    setNewItem({ name: '', quantity: '1', unit: 'pcs', notes: '' });
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleCreate() {
    setError('');
    if (!form.deliveryAddress || !form.pickupDeadline) { setError(t('groceries.new.requiredFields')); return; }
    if (items.length === 0) { setError(t('groceries.new.noItems')); return; }
    setSaving(true);
    try {
      const order = await createOrder({
        supermarket: form.supermarket,
        deliveryAddress: form.deliveryAddress,
        pickupDeadline: new Date(form.pickupDeadline).toISOString(),
        notes: form.notes || undefined,
        items,
      });
      router.replace(`/groceries/${order.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('groceries.new.error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('groceries.new.title')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Order details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('groceries.new.details')}</Text>
        <Text style={styles.label}>{t('groceries.new.supermarket')}</Text>
        <TextInput style={styles.input} value={form.supermarket} onChangeText={v => setForm(p => ({ ...p, supermarket: v }))} />

        <Text style={styles.label}>{t('groceries.new.deliveryAddress')} *</Text>
        <TextInput style={styles.input} value={form.deliveryAddress} onChangeText={v => setForm(p => ({ ...p, deliveryAddress: v }))} placeholder={t('groceries.new.addressPlaceholder')} />

        <Text style={styles.label}>{t('groceries.new.pickupDeadline')} *</Text>
        <TextInput style={styles.input} value={form.pickupDeadline} onChangeText={v => setForm(p => ({ ...p, pickupDeadline: v }))} placeholder="YYYY-MM-DDTHH:MM" />

        <Text style={styles.label}>{t('groceries.new.notes')}</Text>
        <TextInput style={[styles.input, styles.textarea]} value={form.notes} onChangeText={v => setForm(p => ({ ...p, notes: v }))} multiline />
      </View>

      {/* Shopping list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('groceries.new.shoppingList')} ({items.length})</Text>

        {/* Item list */}
        {items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemText}>{item.quantity} {item.unit} — {item.name}</Text>
            <TouchableOpacity onPress={() => removeItem(idx)}>
              <Text style={styles.removeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add item form */}
        <View style={styles.addItemForm}>
          <TextInput style={[styles.input, styles.itemInput]} value={newItem.name} onChangeText={v => setNewItem(p => ({ ...p, name: v }))} placeholder={t('groceries.new.itemName')} />
          <View style={styles.addItemRow}>
            <TextInput style={[styles.input, styles.qtyInput]} value={newItem.quantity} onChangeText={v => setNewItem(p => ({ ...p, quantity: v }))} keyboardType="numeric" />
            <View style={styles.unitChips}>
              {UNITS.map(u => (
                <TouchableOpacity key={u} style={[styles.unitChip, newItem.unit === u && styles.unitChipActive]} onPress={() => setNewItem(p => ({ ...p, unit: u }))}>
                  <Text style={[styles.unitChipText, newItem.unit === u && styles.unitChipTextActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={addItem}>
            <Text style={styles.addBtnText}>+ {t('groceries.new.addItem')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={saving}>
        <Text style={styles.submitBtnText}>{saving ? t('common.saving') : t('groceries.new.create')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  error: { color: '#dc2626', marginBottom: 16, padding: 10, backgroundColor: '#fef2f2', borderRadius: 8 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  label: { fontWeight: '600', color: '#333', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 14, backgroundColor: '#fff' },
  textarea: { height: 70, textAlignVertical: 'top' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemText: { flex: 1, color: '#333' },
  removeBtn: { color: '#dc2626', fontSize: 16, paddingHorizontal: 8 },
  addItemForm: { marginTop: 12 },
  itemInput: { marginBottom: 8 },
  addItemRow: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' },
  qtyInput: { width: 70, marginBottom: 0 },
  unitChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  unitChip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  unitChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  unitChipText: { fontSize: 12, color: '#555' },
  unitChipTextActive: { color: '#fff' },
  addBtn: { backgroundColor: '#f0f9ff', borderRadius: 8, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#bae6fd' },
  addBtnText: { color: '#0284c7', fontWeight: '600' },
  submitBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 16 },
});
