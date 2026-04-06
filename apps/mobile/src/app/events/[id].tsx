import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEventDetail } from '../../hooks/useEvents';
import type { RSVPStatus } from '@cabinconnect/shared';

const RSVP_OPTIONS: Array<{ status: RSVPStatus; labelKey: string; color: string }> = [
  { status: 'going', labelKey: 'events.rsvp.going', color: '#16a34a' },
  { status: 'maybe', labelKey: 'events.rsvp.maybe', color: '#d97706' },
  { status: 'not_going', labelKey: 'events.rsvp.notGoing', color: '#dc2626' },
];

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { event, myRsvp, loading, rsvp, cancelRsvp } = useEventDetail(id);

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (!event) return <Text style={styles.error}>{t('events.notFound')}</Text>;

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.category}>{t(`events.categories.${event.category}`)}</Text>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.organizer}>{t('events.by')} {event.organizerName}</Text>
      </View>

      {/* Date/time/location block */}
      <View style={styles.infoBlock}>
        <InfoRow icon="📅" text={`${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`} />
        <InfoRow icon="📍" text={event.location} />
        {event.resort && <InfoRow icon="🏔️" text={event.resort} />}
        <InfoRow icon="👥" text={`${event.attendeeCount} ${t('events.going')}${event.maxAttendees ? ` / ${event.maxAttendees} max` : ''}`} />
      </View>

      {/* Description */}
      {event.description ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('events.about')}</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
      ) : null}

      {/* RSVP */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('events.rsvp.title')}</Text>
        {myRsvp && (
          <View style={styles.currentRsvp}>
            <Text style={styles.currentRsvpText}>{t('events.rsvp.current')}: {t(`events.rsvp.${myRsvp.status === 'not_going' ? 'notGoing' : myRsvp.status}`)}</Text>
            <TouchableOpacity onPress={cancelRsvp}>
              <Text style={styles.cancelRsvp}>{t('events.rsvp.cancel')}</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.rsvpButtons}>
          {RSVP_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.status}
              style={[styles.rsvpBtn, myRsvp?.status === opt.status && { backgroundColor: opt.color }]}
              onPress={() => rsvp(opt.status)}
            >
              <Text style={[styles.rsvpBtnText, myRsvp?.status === opt.status && { color: '#fff' }]}>
                {t(opt.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 0, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center' },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 32 },
  header: { backgroundColor: '#2563eb', padding: 24, paddingTop: 32 },
  category: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textTransform: 'uppercase', marginBottom: 6 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  organizer: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  infoBlock: { backgroundColor: '#fff', padding: 16, marginBottom: 12, gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoIcon: { fontSize: 16, width: 24 },
  infoText: { flex: 1, fontSize: 14, color: '#333' },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 12, marginHorizontal: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  description: { color: '#444', lineHeight: 22 },
  currentRsvp: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: 10, backgroundColor: '#f0fdf4', borderRadius: 8 },
  currentRsvpText: { color: '#166534', fontWeight: '500' },
  cancelRsvp: { color: '#dc2626', fontSize: 13 },
  rsvpButtons: { flexDirection: 'row', gap: 10 },
  rsvpBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  rsvpBtnText: { fontWeight: '600', color: '#555' },
});
