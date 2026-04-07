import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useOrderDetail } from '../../hooks/useGroceries';
import type { OrderStatus, GroceryOrder } from '@cabinconnect/shared';

const STATUS_STEPS: OrderStatus[] = ['draft', 'submitted', 'volunteer_found', 'out_for_delivery', 'delivered'];

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: '✏️ Draft',
  submitted: '📤 Submitted',
  volunteer_found: '🙋 Volunteer found',
  out_for_delivery: '🚗 Out for delivery',
  delivered: '✅ Delivered',
  no_volunteer: '⚠️ No volunteer',
  cancelled: '✗ Cancelled',
};

function StatusTimeline({ status }: { status: OrderStatus }) {
  const isTerminal = status === 'no_volunteer' || status === 'cancelled';
  return (
    <View style={styles.timeline}>
      {isTerminal ? (
        <View style={styles.terminalBadge}>
          <Text style={styles.terminalText}>{STATUS_LABELS[status]}</Text>
        </View>
      ) : (
        STATUS_STEPS.map((s, i) => {
          const stepIndex = STATUS_STEPS.indexOf(status);
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <View key={s} style={styles.timelineRow}>
              <View style={[styles.timelineDot, done && styles.dotDone, active && styles.dotActive]} />
              {i < STATUS_STEPS.length - 1 && (
                <View style={[styles.timelineLine, done && styles.lineDone]} />
              )}
              <Text style={[styles.timelineLabel, active && styles.labelActive, done && styles.labelDone]}>
                {STATUS_LABELS[s]}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { order, loading, submit, cancel } = useOrderDetail(id);

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (!order) return <Text style={styles.center}>{t('groceries.notFound')}</Text>;

  function confirmCancel() {
    Alert.alert(t('groceries.detail.cancelTitle'), t('groceries.detail.cancelMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('groceries.detail.confirmCancel'), style: 'destructive', onPress: async () => {
        await cancel();
        router.back();
      }},
    ]);
  }

  async function handleSubmit() {
    await submit();
  }

  const deadline = new Date(order.pickupDeadline);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{order.supermarket}</Text>
      <Text style={styles.subtitle}>📍 {order.deliveryAddress}</Text>
      <Text style={styles.subtitle}>🕐 {deadline.toLocaleDateString()} {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>

      {/* Status timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('groceries.detail.status')}</Text>
        <StatusTimeline status={order.status} />
      </View>

      {/* Volunteer info */}
      {order.volunteerName && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('groceries.detail.volunteer')}</Text>
          <Text style={styles.volunteerName}>🙋 {order.volunteerName}</Text>
        </View>
      )}

      {/* No volunteer notice */}
      {order.status === 'no_volunteer' && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>{t('groceries.detail.noVolunteerNotice')}</Text>
        </View>
      )}

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('groceries.detail.items')} ({order.items.length})</Text>
        {order.items.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemQty}>{item.quantity} {item.unit}</Text>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
          </View>
        ))}
      </View>

      {/* Notes */}
      {order.notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('groceries.detail.notes')}</Text>
          <Text style={styles.notes}>{order.notes}</Text>
        </View>
      ) : null}

      {/* Actions */}
      {order.status === 'draft' && (
        <>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>{t('groceries.detail.submit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={confirmCancel}>
            <Text style={styles.cancelBtnText}>{t('groceries.detail.cancel')}</Text>
          </TouchableOpacity>
        </>
      )}
      {order.status === 'submitted' && (
        <TouchableOpacity style={styles.cancelBtn} onPress={confirmCancel}>
          <Text style={styles.cancelBtnText}>{t('groceries.detail.cancel')}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, textAlign: 'center', marginTop: 60, color: '#888' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: '#666', fontSize: 14, marginBottom: 4 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, color: '#333' },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#ddd', backgroundColor: '#fff', marginRight: 10, marginTop: 2 },
  timelineLine: { position: 'absolute', left: 6, top: 16, width: 2, height: 22, backgroundColor: '#ddd' },
  dotDone: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  dotActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  lineDone: { backgroundColor: '#16a34a' },
  timelineLabel: { fontSize: 14, color: '#aaa', paddingBottom: 20 },
  labelDone: { color: '#16a34a' },
  labelActive: { color: '#2563eb', fontWeight: '700' },
  terminalBadge: { backgroundColor: '#fef2f2', borderRadius: 8, padding: 12 },
  terminalText: { color: '#dc2626', fontWeight: '600' },
  volunteerName: { color: '#2563eb', fontWeight: '600', fontSize: 15 },
  warningBox: { backgroundColor: '#fffbeb', borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#fde68a' },
  warningText: { color: '#92400e', fontSize: 14, lineHeight: 20 },
  itemRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  itemQty: { fontSize: 12, color: '#888', marginBottom: 2 },
  itemName: { fontSize: 15, color: '#333', fontWeight: '500' },
  itemNotes: { fontSize: 12, color: '#aaa', marginTop: 2 },
  notes: { color: '#555', lineHeight: 20 },
  submitBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center', marginTop: 4 },
  cancelBtnText: { color: '#dc2626', fontSize: 15 },
});
