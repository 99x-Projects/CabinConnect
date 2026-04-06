import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useAuth } from '../../context/AuthContext';
import type { SupplierCategory } from '@cabinconnect/shared';

const CATEGORIES: SupplierCategory[] = [
  'plumber', 'electrician', 'carpenter', 'cleaner', 'painter', 'roofer', 'landscaper', 'handyman', 'other',
];

export default function NominateSupplierScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { nominate } = useSuppliers();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<SupplierCategory[]>([]);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', website: '',
    description: '', serviceAreas: '', location: { lat: 0, lng: 0 },
  });

  function toggleCategory(cat: SupplierCategory) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  async function handleSubmit() {
    setError('');
    if (!form.name || !form.phone || selectedCategories.length === 0) {
      setError(t('suppliers.nominate.requiredFields'));
      return;
    }
    setSaving(true);
    try {
      await nominate({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        website: form.website || undefined,
        categories: selectedCategories,
        serviceAreas: form.serviceAreas.split(',').map(s => s.trim()).filter(Boolean),
        description: { en: form.description, no: form.description },
        photos: [],
        location: form.location,
        nominatedBy: user!.id,
        status: 'pending',
      } as any);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('suppliers.nominate.error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('suppliers.nominate.title')}</Text>
      <Text style={styles.subtitle}>{t('suppliers.nominate.subtitle')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Field label={`${t('suppliers.nominate.name')} *`}>
        <TextInput style={styles.input} value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} />
      </Field>

      <Field label={`${t('suppliers.nominate.phone')} *`}>
        <TextInput style={styles.input} value={form.phone} onChangeText={v => setForm(p => ({ ...p, phone: v }))} keyboardType="phone-pad" />
      </Field>

      <Field label={t('suppliers.nominate.email')}>
        <TextInput style={styles.input} value={form.email} onChangeText={v => setForm(p => ({ ...p, email: v }))} keyboardType="email-address" autoCapitalize="none" />
      </Field>

      <Field label={t('suppliers.nominate.website')}>
        <TextInput style={styles.input} value={form.website} onChangeText={v => setForm(p => ({ ...p, website: v }))} autoCapitalize="none" />
      </Field>

      <Field label={t('suppliers.nominate.serviceAreas')}>
        <TextInput style={styles.input} value={form.serviceAreas} onChangeText={v => setForm(p => ({ ...p, serviceAreas: v }))} placeholder="e.g. RIMA, Hemsedal" />
      </Field>

      <Field label={t('suppliers.nominate.description')}>
        <TextInput style={[styles.input, styles.textarea]} value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))} multiline />
      </Field>

      <Text style={styles.label}>{t('suppliers.nominate.categories')} *</Text>
      <View style={styles.chips}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, selectedCategories.includes(cat) && styles.chipActive]}
            onPress={() => toggleCategory(cat)}
          >
            <Text style={[styles.chipText, selectedCategories.includes(cat) && styles.chipTextActive]}>
              {t(`suppliers.categories.${cat}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
        <Text style={styles.submitBtnText}>{saving ? t('common.saving') : t('suppliers.nominate.submit')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#666', marginBottom: 20, lineHeight: 20 },
  error: { color: '#dc2626', marginBottom: 16, padding: 10, backgroundColor: '#fef2f2', borderRadius: 8 },
  field: { marginBottom: 16 },
  label: { fontWeight: '600', color: '#333', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 },
  textarea: { height: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#444' },
  chipTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 16 },
});
