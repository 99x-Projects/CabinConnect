import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useToolDetail } from '../../hooks/useTools';
import { useAuth } from '../../context/AuthContext';

const CONDITION_LABEL: Record<string, string> = { new: '🟢 New', good: '🔵 Good', fair: '🟡 Fair', worn: '🔴 Worn' };

export default function ToolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { tool, loading, requestBorrow } = useToolDetail(id);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (!tool) return <Text style={styles.error}>{t('toolshare.notFound')}</Text>;

  const isOwner = tool.ownerId === user?.id;

  async function handleRequest() {
    if (!startDate || !endDate) { setError(t('toolshare.request.datesRequired')); return; }
    setRequesting(true);
    try {
      await requestBorrow(startDate, endDate, message || undefined);
      setSuccess(true);
      setShowModal(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('toolshare.request.error'));
    } finally {
      setRequesting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>{categoryIcon(tool.category)}</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{tool.name}</Text>
          <Text style={styles.category}>{t(`toolshare.categories.${tool.category}`)}</Text>
          <Text style={styles.condition}>{CONDITION_LABEL[tool.condition]}</Text>
        </View>
      </View>

      {/* Availability + price */}
      <View style={styles.section}>
        <View style={styles.availRow}>
          <View style={[styles.availBadge, !tool.available && styles.unavailBadge]}>
            <Text style={styles.availText}>{tool.available ? t('toolshare.available') : t('toolshare.unavailable')}</Text>
          </View>
          {tool.pricePerDay
            ? <Text style={styles.price}>{tool.pricePerDay} {tool.currency} / {t('toolshare.day')}</Text>
            : <Text style={styles.free}>{t('toolshare.free')}</Text>
          }
        </View>
        {tool.resort && <Text style={styles.resort}>📍 {tool.resort}</Text>}
        <Text style={styles.owner}>{t('toolshare.listedBy')} {tool.ownerName}</Text>
      </View>

      {/* Description */}
      {tool.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('toolshare.description')}</Text>
          <Text style={styles.description}>{tool.description}</Text>
        </View>
      )}

      {/* Actions */}
      {!isOwner && tool.available && user && (
        <TouchableOpacity style={styles.requestBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.requestBtnText}>{t('toolshare.requestToBorrow')}</Text>
        </TouchableOpacity>
      )}
      {success && <Text style={styles.successMsg}>{t('toolshare.request.sent')}</Text>}

      {/* Borrow request modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('toolshare.request.title')}</Text>
          <Text style={styles.modalSubtitle}>{tool.name}</Text>
          {error ? <Text style={styles.modalError}>{error}</Text> : null}

          <Text style={styles.fieldLabel}>{t('toolshare.request.startDate')} *</Text>
          <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.fieldLabel}>{t('toolshare.request.endDate')} *</Text>
          <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.fieldLabel}>{t('toolshare.request.message')}</Text>
          <TextInput style={[styles.input, styles.textarea]} value={message} onChangeText={setMessage} multiline placeholder={t('toolshare.request.messagePlaceholder')} />

          <TouchableOpacity style={styles.submitBtn} onPress={handleRequest} disabled={requesting}>
            <Text style={styles.submitBtnText}>{requesting ? t('common.saving') : t('toolshare.request.send')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowModal(false)}>
            <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

function categoryIcon(cat: string): string {
  const icons: Record<string, string> = {
    power_tools: '🔧', hand_tools: '🔨', garden: '🌿',
    snow_removal: '❄️', cleaning: '🧹', camping: '⛺',
    construction: '🏗️', other: '📦',
  };
  return icons[cat] ?? '📦';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center' },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 32 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 12 },
  icon: { fontSize: 48 },
  headerInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  category: { color: '#888', marginBottom: 4 },
  condition: { fontSize: 13 },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 },
  availRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  availBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  unavailBadge: { backgroundColor: '#fef2f2' },
  availText: { color: '#16a34a', fontWeight: '600', fontSize: 13 },
  price: { color: '#2563eb', fontWeight: '600' },
  free: { color: '#16a34a', fontWeight: '600' },
  resort: { color: '#666', marginBottom: 4 },
  owner: { color: '#888', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  description: { color: '#444', lineHeight: 22 },
  requestBtn: { backgroundColor: '#2563eb', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 4 },
  requestBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  successMsg: { color: '#16a34a', textAlign: 'center', marginTop: 12, fontWeight: '600' },
  modal: { flex: 1 },
  modalContent: { padding: 24 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  modalSubtitle: { color: '#666', marginBottom: 20 },
  modalError: { color: '#dc2626', marginBottom: 16, padding: 10, backgroundColor: '#fef2f2', borderRadius: 8 },
  fieldLabel: { fontWeight: '600', color: '#333', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16 },
  textarea: { height: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelModalBtn: { padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 16 },
});
