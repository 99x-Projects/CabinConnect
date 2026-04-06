import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSupplierDetail } from '../../../hooks/useSuppliers';

export default function WriteReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { addReview } = useSupplierDetail(id);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [jobDate, setJobDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (rating === 0) { setError(t('suppliers.review.ratingRequired')); return; }
    setSaving(true);
    try {
      await addReview(rating, comment, jobDate || undefined);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('suppliers.review.error'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('suppliers.review.title')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Star picker */}
      <Text style={styles.label}>{t('suppliers.review.rating')} *</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(i => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <Text style={[styles.star, i <= rating && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>{t('suppliers.review.comment')}</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={comment}
        onChangeText={setComment}
        placeholder={t('suppliers.review.commentPlaceholder')}
        multiline
      />

      <Text style={styles.label}>{t('suppliers.review.jobDate')}</Text>
      <TextInput
        style={styles.input}
        value={jobDate}
        onChangeText={setJobDate}
        placeholder="YYYY-MM-DD"
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={saving}>
        <Text style={styles.submitBtnText}>{saving ? t('common.saving') : t('suppliers.review.submit')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  error: { color: '#dc2626', marginBottom: 16, padding: 10, backgroundColor: '#fef2f2', borderRadius: 8 },
  label: { fontWeight: '600', color: '#333', marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  star: { fontSize: 40, color: '#d1d5db' },
  starActive: { color: '#f59e0b' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 20 },
  textarea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 16 },
});
