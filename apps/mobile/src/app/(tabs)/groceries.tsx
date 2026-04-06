import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMyOrders } from '../../hooks/useGroceries';
import type { GroceryOrder, OrderStatus } from '@cabinconnect/shared';

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; label: string }> = {
  draft:            { color: '#7c3aed', bg: '#f5f3ff', label: '✏️ Draft' },
  submitted:        { color: '#d97706', bg: '#fffbeb', label: '📤 Submitted' },
  volunteer_found:  { color: '#2563eb', bg: '#eff6ff', label: '🙋 Volunteer found' },
  out_for_delivery: { color: '#0891b2', bg: '#ecfeff', label: '🚗 On the way' },
  delivered:        { color: '#16a34a', bg: '#f0fdf4', label: '✅ Delivered' },
  no_volunteer:     { color: '#dc2626', bg: '#fef2f2', label: '⚠️ No volunteer — self-pickup' },
  cancelled:        { color: '#94a3b8', bg: '#f8fafc', label: '✗ Cancelled' },
};

export default function GroceriesScreen() {
  const { t } = useTranslation();
  const { orders, loading, error } = useMyOrders();

  if (loading) return <ActivityIndicator style={styles.center} />;

  return (
    <View style={styles.container}>
      {/* Volunteer banner */}
      <TouchableOpacity style={styles.volunteerBanner} onPress={() => router.push('/groceries/volunteer')}>
        <Text style={styles.volunteerBannerText}>🙋 {t('groceries.volunteerBanner')}</Text>
        <Text style={styles.volunteerBannerArrow}>→</Text>
      </TouchableOpacity>

      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        ListEmptyComponent={<Text style={styles.empty}>{t('groceries.empty')}</Text>}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/groceries/new')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function OrderCard({ order }: { order: GroceryOrder }) {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIG[order.status];
  const deadline = new Date(order.pickupDeadline);
  const isPast = deadline < new Date();

  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/groceries/${order.id}`)}>
      <View style={styles.cardTop}>
        <Text style={styles.cardSupermarket}>{order.supermarket}</Text>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
      <Text style={styles.cardItems}>{order.items.length} {t('groceries.items')}</Text>
      <Text style={styles.cardAddress} numberOfLines={1}>📍 {order.deliveryAddress}</Text>
      <Text style={[styles.cardDeadline, isPast && order.status === 'submitted' && { color: '#dc2626' }]}>
        🕐 {t('groceries.pickupBy')} {deadline.toLocaleDateString()} {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      {order.volunteerName && (
        <Text style={styles.volunteerName}>🙋 {order.volunteerName}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center' },
  volunteerBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#2563eb', padding: 14, margin: 12, borderRadius: 10 },
  volunteerBannerText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  volunteerBannerArrow: { color: '#fff', fontSize: 18 },
  list: { padding: 12, gap: 10, paddingBottom: 80 },
  empty: { textAlign: 'center', color: '#888', marginTop: 48 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardSupermarket: { fontSize: 16, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '600' },
  cardItems: { color: '#555', marginBottom: 4 },
  cardAddress: { color: '#888', fontSize: 13, marginBottom: 4 },
  cardDeadline: { color: '#888', fontSize: 13, marginBottom: 4 },
  volunteerName: { color: '#2563eb', fontSize: 13, fontWeight: '500' },
  fab: { position: 'absolute', right: 20, bottom: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
