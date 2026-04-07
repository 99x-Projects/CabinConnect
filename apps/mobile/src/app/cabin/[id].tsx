import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCabinDetail } from '../../hooks/useCabin';

export default function CabinDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { cabin, maintenance, costSummary, loading } = useCabinDetail(id);

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (!cabin) return <Text style={styles.error}>{t('cabin.notFound')}</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{cabin.name}</Text>
      <Text style={styles.address}>{cabin.address}</Text>

      {/* Key stats */}
      <View style={styles.statsRow}>
        {cabin.bedrooms && <Stat label={t('cabin.bedrooms')} value={String(cabin.bedrooms)} />}
        {cabin.sizeM2 && <Stat label={t('cabin.size')} value={`${cabin.sizeM2} m²`} />}
        {cabin.yearBuilt && <Stat label={t('cabin.yearBuilt')} value={String(cabin.yearBuilt)} />}
      </View>

      {/* Cost summary */}
      {costSummary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('cabin.costs.monthly')}</Text>
          <Text style={styles.costAmount}>
            {costSummary.monthlyTotal.toLocaleString()} {costSummary.currency}
          </Text>
          <Text style={styles.costSub}>
            {costSummary.annualTotal.toLocaleString()} {costSummary.currency} / {t('cabin.costs.year')}
          </Text>
        </View>
      )}

      {/* Quick actions */}
      <View style={styles.actions}>
        <ActionButton label={t('cabin.maintenance.title')} onPress={() => router.push(`/cabin/${id}/maintenance`)} />
        <ActionButton label={t('cabin.costs.title')} onPress={() => router.push(`/cabin/${id}/costs`)} />
        <ActionButton label={t('cabin.instructions.title')} onPress={() => router.push(`/cabin/${id}/instructions`)} />
        <ActionButton label={t('booking.calendar.title')} onPress={() => router.push(`/cabin/${id}/calendar`)} />
      </View>

      {/* Recent maintenance */}
      {maintenance.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('cabin.maintenance.recent')}</Text>
          {maintenance.slice(0, 3).map(r => (
            <View key={r.id} style={styles.maintenanceRow}>
              <Text style={styles.maintenanceTitle}>{r.title}</Text>
              <Text style={styles.maintenanceDate}>{r.date}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Text style={styles.actionBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center' },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 32 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 4 },
  address: { color: '#666', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 14, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#2563eb' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  costAmount: { fontSize: 28, fontWeight: 'bold', color: '#16a34a' },
  costSub: { color: '#888', marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  actionBtn: { flex: 1, minWidth: '45%', backgroundColor: '#2563eb', borderRadius: 10, padding: 14, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '600' },
  maintenanceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  maintenanceTitle: { fontWeight: '500' },
  maintenanceDate: { color: '#888', fontSize: 13 },
});
