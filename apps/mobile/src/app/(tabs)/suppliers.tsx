import { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSuppliers, requestGeoLocation } from '../../hooks/useSuppliers';
import type { Supplier, SupplierCategory } from '@cabinconnect/shared';

const CATEGORIES: Array<SupplierCategory | 'all'> = [
  'all', 'plumber', 'electrician', 'carpenter', 'cleaner', 'painter', 'roofer', 'landscaper', 'handyman', 'other',
];

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#f59e0b' : '#d1d5db' }}>★</Text>
      ))}
    </View>
  );
}

export default function SuppliersScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<SupplierCategory | undefined>();
  const [nearMe, setNearMe] = useState(false);
  const [geoParams, setGeoParams] = useState<{ lat?: number; lng?: number; radiusKm?: number }>({});
  const { suppliers, loading, error } = useSuppliers({ category, ...geoParams });

  async function handleNearMe() {
    if (nearMe) {
      setNearMe(false);
      setGeoParams({});
      return;
    }
    const geo = await requestGeoLocation();
    if (geo) {
      setNearMe(true);
      setGeoParams({ lat: geo.lat, lng: geo.lng, radiusKm: 30 });
    }
  }

  return (
    <View style={styles.container}>
      {/* Category filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={c => c}
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, (item === 'all' ? !category : category === item) && styles.chipActive]}
            onPress={() => setCategory(item === 'all' ? undefined : item as SupplierCategory)}
          >
            <Text style={[styles.chipText, (item === 'all' ? !category : category === item) && styles.chipTextActive]}>
              {t(`suppliers.categories.${item}`)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Near me toggle */}
      <TouchableOpacity style={[styles.nearMeBtn, nearMe && styles.nearMeBtnActive]} onPress={handleNearMe}>
        <Text style={[styles.nearMeText, nearMe && styles.nearMeTextActive]}>
          📍 {nearMe ? t('suppliers.nearMeActive') : t('suppliers.nearMe')}
        </Text>
      </TouchableOpacity>

      {loading
        ? <ActivityIndicator style={styles.center} />
        : error
        ? <Text style={styles.error}>{error}</Text>
        : (
          <FlatList
            data={suppliers}
            keyExtractor={s => s.id}
            ListEmptyComponent={<Text style={styles.empty}>{t('suppliers.empty')}</Text>}
            renderItem={({ item }) => <SupplierCard supplier={item} />}
            contentContainerStyle={styles.list}
          />
        )
      }

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/suppliers/nominate')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/suppliers/${supplier.id}`)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{supplier.name}</Text>
        {supplier.claimedBy && <Text style={styles.verifiedBadge}>{t('suppliers.verified')}</Text>}
      </View>
      <View style={styles.categories}>
        {supplier.categories.slice(0, 3).map(cat => (
          <Text key={cat} style={styles.catBadge}>{t(`suppliers.categories.${cat}`)}</Text>
        ))}
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.ratingRow}>
          <StarRating rating={supplier.averageRating} />
          <Text style={styles.ratingText}>
            {supplier.averageRating > 0 ? supplier.averageRating.toFixed(1) : '—'} ({supplier.reviewCount})
          </Text>
        </View>
        {supplier.phone && <Text style={styles.phone}>{supplier.phone}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filterBar: { maxHeight: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0' },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff' },
  nearMeBtn: { margin: 12, marginBottom: 0, padding: 10, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', alignSelf: 'flex-start' },
  nearMeBtnActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  nearMeText: { fontSize: 13, color: '#555' },
  nearMeTextActive: { color: '#2563eb', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center' },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 32 },
  empty: { textAlign: 'center', color: '#888', marginTop: 48 },
  list: { padding: 12, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardName: { fontSize: 16, fontWeight: '600', flex: 1 },
  verifiedBadge: { fontSize: 11, color: '#16a34a', backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  catBadge: { fontSize: 12, color: '#2563eb', backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 13, color: '#666' },
  phone: { fontSize: 13, color: '#2563eb' },
  fab: { position: 'absolute', right: 20, bottom: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
