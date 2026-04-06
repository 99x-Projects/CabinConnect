import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEvents } from '../../hooks/useEvents';
import type { EventCategory } from '@cabinconnect/shared';

const CATEGORIES: EventCategory[] = ['social', 'sports', 'kids', 'culture', 'community', 'market', 'other'];

export default function NewEventScreen() {
  const { t } = useTranslation();
  const { createEvent } = useEvents();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    resort: '',
    category: 'social' as EventCategory,
    maxAttendees: '',
  });

  async function handleCreate() {
    setError('');
    if (!form.title || !form.location || !form.startDate || !form.endDate) {
      setError(t('events.new.requiredFields'));
      return;
    }
    setSaving(true);
    try {
      await createEvent({
        title: form.title,
        description: form.description,
        location: form.location,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        resort: form.resort || undefined,
        category: form.category,
        status: 'published',
        attendeeCount: 0,
        maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('events.new.error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('events.new.title')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Field label={t('events.new.eventTitle')} required>
        <TextInput style={styles.input} value={form.title} onChangeText={v => setForm(p => ({ ...p, title: v }))} />
      </Field>

      <Field label={t('events.new.description')}>
        <TextInput style={[styles.input, styles.textarea]} value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))} multiline />
      </Field>

      <Field label={t('events.new.location')} required>
        <TextInput style={styles.input} value={form.location} onChangeText={v => setForm(p => ({ ...p, location: v }))} />
      </Field>

      <Field label={t('events.new.resort')}>
        <TextInput style={styles.input} value={form.resort} onChangeText={v => setForm(p => ({ ...p, resort: v }))} placeholder="e.g. RIMA" />
      </Field>

      <Field label={t('events.new.startDate')} required>
        <TextInput style={styles.input} value={form.startDate} onChangeText={v => setForm(p => ({ ...p, startDate: v }))} placeholder="YYYY-MM-DDTHH:MM" />
      </Field>

      <Field label={t('events.new.endDate')} required>
        <TextInput style={styles.input} value={form.endDate} onChangeText={v => setForm(p => ({ ...p, endDate: v }))} placeholder="YYYY-MM-DDTHH:MM" />
      </Field>

      <Field label={t('events.new.maxAttendees')}>
        <TextInput style={styles.input} value={form.maxAttendees} onChangeText={v => setForm(p => ({ ...p, maxAttendees: v }))} keyboardType="numeric" />
      </Field>

      <Field label={t('events.new.category')}>
        <View style={styles.chips}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, form.category === cat && styles.chipActive]}
              onPress={() => setForm(p => ({ ...p, category: cat }))}
            >
              <Text style={[styles.chipText, form.category === cat && styles.chipTextActive]}>
                {t(`events.categories.${cat}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Field>

      <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? t('common.saving') : t('events.new.publish')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  error: { color: '#dc2626', marginBottom: 16, padding: 10, backgroundColor: '#fef2f2', borderRadius: 8 },
  field: { marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 6, color: '#333' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 },
  textarea: { height: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#444' },
  chipTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 16 },
});
