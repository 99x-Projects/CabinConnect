import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCabinDetail } from '../../../hooks/useCabin';
import type { MaintenanceCategory } from '@cabinconnect/shared';

const CATEGORIES: MaintenanceCategory[] = [
  'plumbing', 'electrical', 'roofing', 'heating', 'cleaning', 'renovation', 'inspection', 'other',
];

export default function MaintenanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { maintenance, addMaintenance } = useCabinDetail(id);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', date: new Date().toISOString().slice(0, 10),
    category: 'other' as MaintenanceCategory, cost: '', completedBy: '', description: '',
  });

  async function handleAdd() {
    if (!form.title) return;
    await addMaintenance({
      title: form.title,
      date: form.date,
      category: form.category,
      cost: form.cost ? Number(form.cost) : undefined,
      completedBy: form.completedBy || undefined,
      description: form.description || undefined,
    });
    setShowForm(false);
    setForm({ title: '', date: new Date().toISOString().slice(0, 10), category: 'other', cost: '', completedBy: '', description: '' });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={maintenance}
        keyExtractor={r => r.id}
        ListEmptyComponent={<Text style={styles.empty}>{t('cabin.maintenance.empty')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.badge}>{item.category}</Text>
            </View>
            <Text style={styles.date}>{item.date}</Text>
            {item.cost !== undefined && <Text style={styles.cost}>{item.cost.toLocaleString()} NOK</Text>}
            {item.completedBy && <Text style={styles.meta}>By: {item.completedBy}</Text>}
            {item.description && <Text style={styles.desc}>{item.description}</Text>}
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('cabin.maintenance.add')}</Text>

          <TextInput style={styles.input} placeholder={t('cabin.maintenance.titlePlaceholder')} value={form.title} onChangeText={v => setForm(p => ({ ...p, title: v }))} />
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={form.date} onChangeText={v => setForm(p => ({ ...p, date: v }))} />
          <TextInput style={styles.input} placeholder={t('cabin.maintenance.costPlaceholder')} value={form.cost} onChangeText={v => setForm(p => ({ ...p, cost: v }))} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder={t('cabin.maintenance.completedBy')} value={form.completedBy} onChangeText={v => setForm(p => ({ ...p, completedBy: v }))} />
          <TextInput style={[styles.input, styles.textarea]} placeholder={t('cabin.maintenance.notes')} value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))} multiline />

          <Text style={styles.label}>{t('cabin.maintenance.category')}</Text>
          <View style={styles.chips}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, form.category === cat && styles.chipActive]}
                onPress={() => setForm(p => ({ ...p, category: cat }))}
              >
                <Text style={[styles.chipText, form.category === cat && styles.chipTextActive]}>{cat}</Text>
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
  list: { padding: 16, gap: 10 },
  empty: { textAlign: 'center', color: '#888', marginTop: 48 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  badge: { backgroundColor: '#eff6ff', color: '#2563eb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 12 },
  date: { color: '#888', fontSize: 13, marginBottom: 4 },
  cost: { color: '#16a34a', fontWeight: '600', marginBottom: 2 },
  meta: { color: '#666', fontSize: 13 },
  desc: { color: '#666', fontSize: 13, marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  modal: { flex: 1 },
  modalContent: { padding: 24 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  textarea: { height: 80, textAlignVertical: 'top' },
  label: { fontWeight: '600', marginBottom: 8 },
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
