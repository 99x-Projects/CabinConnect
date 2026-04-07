import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCabinCalendar } from '../../../hooks/useBooking';
import type { AvailabilityWindow, CabinBooking } from '@cabinconnect/shared';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function isoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

function addMonths(date: Date, n: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  d.setDate(1);
  return d;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  // Monday = 0
  const d = (new Date(year, month, 1).getDay() + 6) % 7;
  return d;
}

function dateInRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

type DayState = 'none' | 'available' | 'booked-mine' | 'booked-other' | 'selected-start' | 'selected-end' | 'selected-range';

export default function CabinCalendarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { windows, bookings, loading, reload, createWindow, deleteWindow, createBooking, cancelBooking } = useCabinCalendar(id);

  const [month, setMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selectStart, setSelectStart] = useState<string | null>(null);
  const [mode, setMode] = useState<'book' | 'window' | null>(null);

  if (loading) return <ActivityIndicator style={styles.center} />;

  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const daysInMonth = getDaysInMonth(year, monthIdx);
  const firstWeekday = getFirstWeekday(year, monthIdx);

  function dayState(dateStr: string): DayState {
    const inWindow = windows.some(w => dateInRange(dateStr, w.startDate, w.endDate));
    const myBooking = bookings.find(b => b.status === 'confirmed' && dateInRange(dateStr, b.startDate, b.endDate));
    if (myBooking) return 'booked-mine';
    if (inWindow) return 'available';
    return 'none';
  }

  function handleDayPress(dateStr: string) {
    if (!mode) return;
    if (!selectStart) {
      setSelectStart(dateStr);
    } else {
      const start = selectStart < dateStr ? selectStart : dateStr;
      const end = selectStart < dateStr ? dateStr : selectStart;
      setSelectStart(null);
      if (mode === 'book') {
        router.push(`/cabin/${id}/book?start=${start}&end=${end}`);
      } else {
        router.push(`/cabin/${id}/book-window?start=${start}&end=${end}`);
      }
      setMode(null);
    }
  }

  async function handleDeleteWindow(w: AvailabilityWindow) {
    Alert.alert(t('booking.calendar.deleteWindow'), t('booking.calendar.deleteWindowMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteWindow(w.id) },
    ]);
  }

  async function handleCancelBooking(b: CabinBooking) {
    Alert.alert(t('booking.calendar.cancelBooking'), t('booking.calendar.cancelBookingMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('booking.calendar.confirmCancel'), style: 'destructive', onPress: () => cancelBooking(b.id) },
    ]);
  }

  const cells: (string | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, monthIdx, i + 1);
      return isoDate(d);
    }),
  ];

  // Pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Month navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => setMonth(m => addMonths(m, -1))} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => setMonth(m => addMonths(m, 1))} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color="#dcfce7" label={t('booking.calendar.available')} />
        <LegendItem color="#bfdbfe" label={t('booking.calendar.booked')} />
      </View>

      {/* Mode selector */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'window' && styles.modeBtnActive]}
          onPress={() => setMode(m => m === 'window' ? null : 'window')}
        >
          <Text style={[styles.modeBtnText, mode === 'window' && styles.modeBtnTextActive]}>
            + {t('booking.calendar.addWindow')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, styles.modeBtnBook, mode === 'book' && styles.modeBtnBookActive]}
          onPress={() => setMode(m => m === 'book' ? null : 'book')}
        >
          <Text style={[styles.modeBtnText, mode === 'book' && styles.modeBtnTextActive]}>
            🗓 {t('booking.calendar.book')}
          </Text>
        </TouchableOpacity>
      </View>
      {mode && (
        <Text style={styles.modeHint}>
          {selectStart
            ? t('booking.calendar.tapEnd')
            : t('booking.calendar.tapStart')}
        </Text>
      )}

      {/* Day headers */}
      <View style={styles.grid}>
        {DAYS.map(d => (
          <View key={d} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{d}</Text>
          </View>
        ))}

        {/* Day cells */}
        {cells.map((dateStr, i) => {
          if (!dateStr) return <View key={`empty-${i}`} style={styles.cell} />;
          const state = dayState(dateStr);
          const isStart = dateStr === selectStart;
          const today = isoDate(new Date());
          const isPast = dateStr < today;
          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.cell,
                state === 'available' && styles.cellAvailable,
                state === 'booked-mine' && styles.cellBooked,
                isStart && styles.cellSelected,
                isPast && styles.cellPast,
              ]}
              onPress={() => !isPast && handleDayPress(dateStr)}
              disabled={!mode || isPast}
            >
              <Text style={[styles.cellText, isPast && styles.cellTextPast]}>
                {new Date(dateStr + 'T12:00:00').getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Availability windows list */}
      {windows.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('booking.calendar.windows')}</Text>
          {windows.map(w => (
            <View key={w.id} style={styles.windowRow}>
              <View style={styles.windowDot} />
              <Text style={styles.windowText}>{w.startDate} → {w.endDate}</Text>
              {w.notes ? <Text style={styles.windowNotes}>{w.notes}</Text> : null}
              <TouchableOpacity onPress={() => handleDeleteWindow(w)}>
                <Text style={styles.deleteBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Bookings list */}
      {bookings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('booking.calendar.bookings')}</Text>
          {bookings.map(b => (
            <View key={b.id} style={styles.bookingRow}>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingUser}>👤 {b.userName}</Text>
                <Text style={styles.bookingDates}>{b.startDate} → {b.endDate}</Text>
                {b.notes ? <Text style={styles.bookingNotes}>{b.notes}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => handleCancelBooking(b)}>
                <Text style={styles.deleteBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Invites link */}
      <TouchableOpacity style={styles.invitesBtn} onPress={() => router.push(`/cabin/${id}/invites`)}>
        <Text style={styles.invitesBtnText}>👥 {t('booking.calendar.manageInvites')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { padding: 10 },
  navBtnText: { fontSize: 28, color: '#2563eb', lineHeight: 30 },
  monthLabel: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#666' },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  modeBtn: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
  modeBtnBook: { borderColor: '#2563eb' },
  modeBtnBookActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  modeBtnText: { fontSize: 13, fontWeight: '600', color: '#555' },
  modeBtnTextActive: { color: '#fff' },
  modeHint: { textAlign: 'center', color: '#2563eb', fontSize: 13, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  dayHeader: { width: '14.28%', alignItems: 'center', paddingVertical: 8, backgroundColor: '#f8fafc' },
  dayHeaderText: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#f1f5f9' },
  cellAvailable: { backgroundColor: '#dcfce7' },
  cellBooked: { backgroundColor: '#bfdbfe' },
  cellSelected: { backgroundColor: '#2563eb' },
  cellPast: { opacity: 0.35 },
  cellText: { fontSize: 13, color: '#334155' },
  cellTextPast: { color: '#94a3b8' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 12 },
  windowRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 8 },
  windowDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#16a34a' },
  windowText: { flex: 1, fontSize: 14, color: '#333' },
  windowNotes: { fontSize: 12, color: '#888' },
  bookingRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 8 },
  bookingInfo: { flex: 1 },
  bookingUser: { fontWeight: '600', fontSize: 14, color: '#333', marginBottom: 2 },
  bookingDates: { fontSize: 13, color: '#555' },
  bookingNotes: { fontSize: 12, color: '#888', marginTop: 2 },
  deleteBtn: { color: '#dc2626', fontSize: 16, paddingHorizontal: 4 },
  invitesBtn: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  invitesBtnText: { color: '#2563eb', fontWeight: '600', fontSize: 15 },
});
