import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCabinCalendar } from '../../../hooks/useBooking';

export default function BookWindowScreen() {
  const { id, start, end } = useLocalSearchParams<{ id: string; start: string; end: string }>();
  const { t } = useTranslation();
  const { createWindow } = useCabinCalendar(id);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!start || !end) return;
    setSaving(true);
    setError('');
    try {
      await createWindow({ startDate: start, endDate: end, notes: notes || undefined });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('booking.window.error'));
    } finally {
      setSaving(false);
    }
  }

  const days = start && end
    ? Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1)
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('booking.window.title')}</Text>
      <Text style={styles.subtitle}>{t('booking.window.subtitle')}</Text>

      <View style={styles.section}>
        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>{t('booking.window.from')}</Text>
            <Text style={styles.dateValue}>{start}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>{t('booking.window.to')}</Text>
            <Text style={styles.dateValue}>{end}</Text>
          </View>
        </View>
        <Text style={styles.days}>{days} {t('booking.window.days')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('booking.window.notes')}</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('booking.window.notesPlaceholder')}
          multiline
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={saving}>
        <Text style={styles.submitBtnText}>{saving ? t('common.saving') : t('booking.window.create')}</Text>
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
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#666', fontSize: 14, marginBottom: 20 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateBox: { flex: 1 },
  dateLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  dateValue: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  arrow: { fontSize: 20, color: '#94a3b8', marginHorizontal: 12 },
  days: { marginTop: 12, color: '#16a34a', fontWeight: '600', fontSize: 14 },
  label: { fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' },
  textarea: { height: 80, textAlignVertical: 'top' },
  error: { color: '#dc2626', marginBottom: 12, backgroundColor: '#fef2f2', padding: 10, borderRadius: 8 },
  submitBtn: { backgroundColor: '#16a34a', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 4 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 15 },
});
