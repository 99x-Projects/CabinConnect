import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTools } from '../../hooks/useTools';
import type { ToolCategory, ToolCondition } from '@cabinconnect/shared';

const CATEGORIES: ToolCategory[] = ['power_tools', 'hand_tools', 'garden', 'snow_removal', 'cleaning', 'camping', 'construction', 'other'];
const CONDITIONS: ToolCondition[] = ['new', 'good', 'fair', 'worn'];

export default function NewToolScreen() {
  const { t } = useTranslation();
  const { listTool } = useTools();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', category: 'hand_tools' as ToolCategory,
    condition: 'good' as ToolCondition, resort: '', pricePerDay: '', currency: 'NOK',
  });

  async function handleSubmit() {
    setError('');
    if (!form.name) { setError(t('toolshare.new.nameRequired')); return; }
    setSaving(true);
    try {
      await listTool({
        name: form.name,
        description: form.description || undefined,
        category: form.category,
        condition: form.condition,
        photos: [],
        resort: form.resort || undefined,
        pricePerDay: form.pricePerDay ? Number(form.pricePerDay) : undefined,
        currency: form.currency,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('toolshare.new.error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('toolshare.new.title')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Field label={`${t('toolshare.new.name')} *`}>
        <TextInput style={styles.input} value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} />
      </Field>

      <Field label={t('toolshare.new.description')}>
        <TextInput style={[styles.input, styles.textarea]} value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))} multiline />
      </Field>

      <Field label={t('toolshare.new.resort')}>
        <TextInput style={styles.input} value={form.resort} onChangeText={v => setForm(p => ({ ...p, resort: v }))} placeholder="e.g. RIMA" />
      </Field>

      <Field label={t('toolshare.new.pricePerDay')}>
        <TextInput style={styles.input} value={form.pricePerDay} onChangeText={v => setForm(p => ({ ...p, pricePerDay: v }))} keyboardType="numeric" placeholder={t('toolshare.new.freeHint')} />
      </Field>

      <Text style={styles.label}>{t('toolshare.new.category')}</Text>
      <View style={styles.chips}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.chip, form.category === cat && styles.chipActive]} onPress={() => setForm(p => ({ ...p, category: cat }))}>
            <Text style={[styles.chipText, form.category === cat && styles.chipTextActive]}>{t(`toolshare.categories.${cat}`)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t('toolshare.new.condition')}</Text>
      <View style={styles.chips}>
        {CONDITIONS.map(cond => (
          <TouchableOpacity key={cond} style={[styles.chip, form.condition === cond && styles.chipActive]} onPress={() => setForm(p => ({ ...p, condition: cond }))}>
            <Text style={[styles.chipText, form.condition === cond && styles.chipTextActive]}>{t(`toolshare.conditions.${cond}`)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
        <Text style={styles.submitBtnText}>{saving ? t('common.saving') : t('toolshare.new.submit')}</Text>
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
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  error: { color: '#dc2626', marginBottom: 16, padding: 10, backgroundColor: '#fef2f2', borderRadius: 8 },
  field: { marginBottom: 16 },
  label: { fontWeight: '600', color: '#333', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 },
  textarea: { height: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#444' },
  chipTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 16 },
});
