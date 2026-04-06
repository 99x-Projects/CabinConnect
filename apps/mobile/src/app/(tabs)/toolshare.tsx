import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTools } from '../../hooks/useTools';
import type { Tool, ToolCategory } from '@cabinconnect/shared';

const CATEGORIES: Array<ToolCategory | 'all'> = [
  'all', 'power_tools', 'hand_tools', 'garden', 'snow_removal', 'cleaning', 'camping', 'construction', 'other',
];

const CONDITION_COLOR: Record<string, string> = {
  new: '#16a34a', good: '#2563eb', fair: '#d97706', worn: '#dc2626',
};

export default function ToolShareScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<ToolCategory | undefined>();
  const { tools, loading, error } = useTools({ category });

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
            onPress={() => setCategory(item === 'all' ? undefined : item as ToolCategory)}
          >
            <Text style={[styles.chipText, (item === 'all' ? !category : category === item) && styles.chipTextActive]}>
              {t(`toolshare.categories.${item}`)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading
        ? <ActivityIndicator style={styles.center} />
        : error
        ? <Text style={styles.error}>{error}</Text>
        : (
          <FlatList
            data={tools}
            keyExtractor={t => t.id}
            numColumns={2}
            ListEmptyComponent={<Text style={styles.empty}>{t('toolshare.empty')}</Text>}
            renderItem={({ item }) => <ToolCard tool={item} />}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.row}
          />
        )
      }

      <View style={styles.fabGroup}>
        <TouchableOpacity style={[styles.fab, styles.fabSecondary]} onPress={() => router.push('/tools/activity')}>
          <Text style={styles.fabSecondaryText}>☰</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/tools/new')}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/tools/${tool.id}`)}>
      <View style={styles.cardTop}>
        <Text style={styles.toolIcon}>{categoryIcon(tool.category)}</Text>
        <View style={[styles.conditionDot, { backgroundColor: CONDITION_COLOR[tool.condition] ?? '#888' }]} />
      </View>
      <Text style={styles.cardName} numberOfLines={2}>{tool.name}</Text>
      <Text style={styles.cardCategory}>{t(`toolshare.categories.${tool.category}`)}</Text>
      {tool.pricePerDay
        ? <Text style={styles.price}>{tool.pricePerDay} {tool.currency}/{t('toolshare.day')}</Text>
        : <Text style={styles.free}>{t('toolshare.free')}</Text>
      }
      <Text style={styles.ownerName}>{tool.ownerName}</Text>
    </TouchableOpacity>
  );
}

function categoryIcon(cat: ToolCategory): string {
  const icons: Record<ToolCategory, string> = {
    power_tools: '🔧', hand_tools: '🔨', garden: '🌿',
    snow_removal: '❄️', cleaning: '🧹', camping: '⛺',
    construction: '🏗️', other: '📦',
  };
  return icons[cat] ?? '📦';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filterBar: { maxHeight: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0' },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff' },
  center: { flex: 1, justifyContent: 'center' },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 32 },
  empty: { textAlign: 'center', color: '#888', marginTop: 48 },
  grid: { padding: 10 },
  row: { gap: 10 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  toolIcon: { fontSize: 28 },
  conditionDot: { width: 10, height: 10, borderRadius: 5 },
  cardName: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  cardCategory: { fontSize: 12, color: '#888', marginBottom: 6 },
  price: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  free: { fontSize: 13, color: '#16a34a', fontWeight: '600' },
  ownerName: { fontSize: 11, color: '#aaa', marginTop: 6 },
  fabGroup: { position: 'absolute', right: 20, bottom: 28, flexDirection: 'row', gap: 12, alignItems: 'center' },
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  fabSecondaryText: { fontSize: 20, color: '#555' },
});
