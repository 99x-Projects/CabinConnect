import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useOrderDetail } from '../../hooks/useGroceries';
import { useVolunteerOrders } from '../../hooks/useGroceries';

export default function VolunteerActiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { order, loading } = useOrderDetail(id);
  const { markStatus } = useVolunteerOrders();

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (!order) return <Text style={styles.center}>{t('groceries.notFound')}</Text>;

  async function handleMark(status: 'out_for_delivery' | 'delivered') {
    const msg = status === 'out_for_delivery'
      ? t('groceries.volunteerActive.confirmOnWay')
      : t('groceries.volunteerActive.confirmDelivered');
    Alert.alert(t('groceries.volunteerActive.confirm'), msg, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.confirm'), onPress: async () => {
        await markStatus(order!.id, status);
        if (status === 'delivered') router.replace('/(tabs)/groceries');
      }},
    ]);
  }

  const deadline = new Date(order.pickupDeadline);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>🛒 {t('groceries.volunteerActive.activeDelivery')}</Text>
        <Text style={styles.bannerSub}>{order.supermarket} → {order.deliveryAddress}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('groceries.volunteerActive.orderedBy')}</Text>
        <Text style={styles.infoText}>👤 {order.userName}</Text>
        <Text style={styles.infoText}>🕐 {t('groceries.pickupBy')} {deadline.toLocaleDateString()} {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        {order.notes ? <Text style={styles.notes}>{order.notes}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('groceries.detail.items')} ({order.items.length})</Text>
        {order.items.map((item, i) => (
          <View key={i} style={[styles.itemRow, i === order.items.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={styles.itemCheck} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>{item.quantity} {item.unit}</Text>
            </View>
            {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
          </View>
        ))}
      </View>

      {order.status === 'volunteer_found' && (
        <TouchableOpacity style={styles.onWayBtn} onPress={() => handleMark('out_for_delivery')}>
          <Text style={styles.onWayBtnText}>🚗 {t('groceries.volunteerActive.markOnWay')}</Text>
        </TouchableOpacity>
      )}
      {order.status === 'out_for_delivery' && (
        <TouchableOpacity style={styles.deliveredBtn} onPress={() => handleMark('delivered')}>
          <Text style={styles.deliveredBtnText}>✅ {t('groceries.volunteerActive.markDelivered')}</Text>
        </TouchableOpacity>
      )}
      {(order.status === 'delivered') && (
        <View style={styles.completedBanner}>
          <Text style={styles.completedText}>✅ {t('groceries.volunteerActive.completed')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, textAlign: 'center', marginTop: 60, color: '#888' },
  banner: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, marginBottom: 16 },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  bannerSub: { color: '#bfdbfe', fontSize: 14 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, color: '#333' },
  infoText: { color: '#555', fontSize: 14, marginBottom: 6 },
  notes: { color: '#888', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 10 },
  itemCheck: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, color: '#333', fontWeight: '500' },
  itemQty: { fontSize: 12, color: '#888', marginTop: 2 },
  itemNotes: { fontSize: 12, color: '#aaa' },
  onWayBtn: { backgroundColor: '#0891b2', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  onWayBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  deliveredBtn: { backgroundColor: '#16a34a', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  deliveredBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  completedBanner: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16, alignItems: 'center' },
  completedText: { color: '#16a34a', fontWeight: '700', fontSize: 16 },
});
