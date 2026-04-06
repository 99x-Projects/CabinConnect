import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEvents } from '../../hooks/useEvents';
import type { CabinEvent, EventCategory } from '@cabinconnect/shared';

const CATEGORIES: Array<EventCategory | 'all'> = ['all', 'social', 'sports', 'kids', 'culture', 'community', 'market', 'other'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function EventsScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<EventCategory | undefined>();
  const { events, loading, error } = useEvents({ category });

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

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
            style={[styles.filterChip, (item === 'all' ? !category : category === item) && styles.filterChipActive]}
            onPress={() => setCategory(item === 'all' ? undefined : item as EventCategory)}
          >
            <Text style={[styles.filterChipText, (item === 'all' ? !category : category === item) && styles.filterChipTextActive]}>
              {t(`events.categories.${item}`)}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={events}
        keyExtractor={e => e.id}
        ListEmptyComponent={<Text style={styles.empty}>{t('events.empty')}</Text>}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/events/new')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function EventCard({ event }: { event: CabinEvent }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/events/${event.id}`)}>
      <View style={styles.dateBlock}>
        <Text style={styles.dateDay}>{new Date(event.startDate).getDate()}</Text>
        <Text style={styles.dateMonth}>{new Date(event.startDate).toLocaleString(undefined, { month: 'short' })}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.cardMeta}>{formatTime(event.startDate)} · {event.location}</Text>
        {event.resort && <Text style={styles.cardResort}>{event.resort}</Text>}
        <View style={styles.cardFooter}>
          <Text style={styles.categoryBadge}>{t(`events.categories.${event.category}`)}</Text>
          <Text style={styles.attendees}>{event.attendeeCount} {t('events.going')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center' },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 32 },
  empty: { textAlign: 'center', color: '#888', marginTop: 48 },
  filterBar: { maxHeight: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f0f0f0' },
  filterChipActive: { backgroundColor: '#2563eb' },
  filterChipText: { fontSize: 13, color: '#555' },
  filterChipTextActive: { color: '#fff' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  dateBlock: { width: 58, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', padding: 10 },
  dateDay: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  dateMonth: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textTransform: 'uppercase' },
  cardBody: { flex: 1, padding: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  cardMeta: { color: '#666', fontSize: 13, marginBottom: 2 },
  cardResort: { color: '#2563eb', fontSize: 12, marginBottom: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { fontSize: 12, color: '#888', backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  attendees: { fontSize: 12, color: '#16a34a', fontWeight: '500' },
  fab: { position: 'absolute', right: 20, bottom: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
