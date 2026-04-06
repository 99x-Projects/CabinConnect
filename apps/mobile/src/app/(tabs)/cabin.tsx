import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCabins } from '../../hooks/useCabin';
import type { Cabin } from '@cabinconnect/shared';

export default function CabinListScreen() {
  const { t } = useTranslation();
  const { cabins, loading, error } = useCabins();

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={cabins}
        keyExtractor={c => c.id}
        ListEmptyComponent={<Text style={styles.empty}>{t('cabin.noCabins')}</Text>}
        renderItem={({ item }) => <CabinCard cabin={item} />}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/cabin/new')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function CabinCard({ cabin }: { cabin: Cabin }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/cabin/${cabin.id}`)}>
      <Text style={styles.cardTitle}>{cabin.name}</Text>
      <Text style={styles.cardSub}>{cabin.address}</Text>
      {cabin.resort && <Text style={styles.cardResort}>{cabin.resort}</Text>}
      <View style={styles.cardMeta}>
        {cabin.bedrooms && <Text style={styles.metaText}>{cabin.bedrooms} BR</Text>}
        {cabin.sizeM2 && <Text style={styles.metaText}>{cabin.sizeM2} m²</Text>}
        {cabin.yearBuilt && <Text style={styles.metaText}>Built {cabin.yearBuilt}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16, gap: 12 },
  center: { flex: 1, justifyContent: 'center' },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 32 },
  empty: { textAlign: 'center', color: '#888', marginTop: 48 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  cardSub: { color: '#666', marginBottom: 4 },
  cardResort: { color: '#2563eb', fontSize: 13, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 12 },
  metaText: { fontSize: 13, color: '#888', backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  fab: { position: 'absolute', right: 20, bottom: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', shadowColor: '#2563eb', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
