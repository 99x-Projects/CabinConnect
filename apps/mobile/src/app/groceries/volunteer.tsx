import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useVolunteerOrders } from '../../hooks/useGroceries';
import type { GroceryOrder } from '@cabinconnect/shared';

export default function VolunteerScreen() {
  const { t } = useTranslation();
  const { orders, loading, reload, acceptDelivery, markStatus } = useVolunteerOrders();
  const [accepting, setAccepting] = useState<string | null>(null);

  async function handleAccept(orderId: string) {
    setAccepting(orderId);
    try {
      const order = await acceptDelivery(orderId);
      router.push(`/groceries/volunteer-active?id=${order.id}`);
    } catch {
      Alert.alert(t('groceries.volunteer.acceptError'));
    } finally {
      setAccepting(null);
    }
  }

  if (loading) return <ActivityIndicator style={styles.center} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('groceries.volunteer.title')}</Text>
      <Text style={styles.subheader}>{t('groceries.volunteer.subtitle')}</Text>

      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        onRefresh={reload}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.empty}>{t('groceries.volunteer.empty')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            accepting={accepting === item.id}
            onAccept={() => handleAccept(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

function OrderCard({ order, accepting, onAccept }: { order: GroceryOrder; accepting: boolean; onAccept: () => void }) {
  const { t } = useTranslation();
  const deadline = new Date(order.pickupDeadline);
  const hoursLeft = Math.max(0, Math.round((deadline.getTime() - Date.now()) / 3_600_000));
  const urgent = hoursLeft < 6;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardSupermarket}>{order.supermarket}</Text>
        <View style={[styles.urgencyBadge, urgent && styles.urgencyBadgeUrgent]}>
          <Text style={[styles.urgencyText, urgent && styles.urgencyTextUrgent]}>
            {urgent ? '⚡ ' : '🕐 '}{hoursLeft}h {t('groceries.volunteer.left')}
          </Text>
        </View>
      </View>

      <Text style={styles.cardUser}>👤 {order.userName}</Text>
      <Text style={styles.cardAddress}>📍 {order.deliveryAddress}</Text>
      <Text style={styles.cardItems}>{order.items.length} {t('groceries.items')}</Text>

      <View style={styles.itemPreview}>
        {order.items.slice(0, 3).map((item, i) => (
          <Text key={i} style={styles.itemChip}>{item.quantity} {item.unit} {item.name}</Text>
        ))}
        {order.items.length > 3 && (
          <Text style={styles.itemChip}>+{order.items.length - 3} {t('groceries.volunteer.more')}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.acceptBtn, accepting && styles.acceptBtnDisabled]}
        onPress={onAccept}
        disabled={accepting}
      >
        <Text style={styles.acceptBtnText}>
          {accepting ? t('groceries.volunteer.accepting') : t('groceries.volunteer.accept')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1 },
  header: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  subheader: { fontSize: 14, color: '#666', paddingHorizontal: 16, paddingBottom: 12 },
  list: { padding: 12, gap: 12, paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  empty: { color: '#888', fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardSupermarket: { fontSize: 17, fontWeight: '700' },
  urgencyBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  urgencyBadgeUrgent: { backgroundColor: '#fff7ed' },
  urgencyText: { fontSize: 12, fontWeight: '600', color: '#16a34a' },
  urgencyTextUrgent: { color: '#ea580c' },
  cardUser: { color: '#555', fontSize: 13, marginBottom: 4 },
  cardAddress: { color: '#555', fontSize: 13, marginBottom: 4 },
  cardItems: { color: '#888', fontSize: 13, marginBottom: 10 },
  itemPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  itemChip: { backgroundColor: '#f1f5f9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 12, color: '#475569' },
  acceptBtn: { backgroundColor: '#16a34a', borderRadius: 8, padding: 12, alignItems: 'center' },
  acceptBtnDisabled: { backgroundColor: '#86efac' },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
