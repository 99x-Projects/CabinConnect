import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCabinInvites } from '../../../hooks/useBooking';
import type { CabinInvite } from '@cabinconnect/shared';

export default function InvitesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { invites, loading, invite, revoke } = useCabinInvites(id);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function handleInvite() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) { setError(t('booking.invites.invalidEmail')); return; }
    setSending(true);
    setError('');
    try {
      await invite(trimmed);
      setEmail('');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('booking.invites.error'));
    } finally {
      setSending(false);
    }
  }

  function confirmRevoke(inv: CabinInvite) {
    Alert.alert(t('booking.invites.revokeTitle'), `${t('booking.invites.revokeMsg')} ${inv.invitedEmail}?`, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('booking.invites.revoke'), style: 'destructive', onPress: () => revoke(inv.id) },
    ]);
  }

  if (loading) return <ActivityIndicator style={styles.center} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('booking.invites.title')}</Text>
      <Text style={styles.subtitle}>{t('booking.invites.subtitle')}</Text>

      {/* Invite form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={v => { setEmail(v); setError(''); }}
          placeholder={t('booking.invites.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.inviteBtn} onPress={handleInvite} disabled={sending}>
          <Text style={styles.inviteBtnText}>{sending ? t('common.saving') : t('booking.invites.send')}</Text>
        </TouchableOpacity>
      </View>

      {/* Invites list */}
      <FlatList
        data={invites}
        keyExtractor={i => i.id}
        ListEmptyComponent={<Text style={styles.empty}>{t('booking.invites.empty')}</Text>}
        renderItem={({ item }) => (
          <View style={styles.inviteRow}>
            <View style={styles.inviteInfo}>
              <Text style={styles.inviteEmail}>{item.invitedEmail}</Text>
              {item.invitedUserName
                ? <Text style={styles.inviteUser}>✅ {item.invitedUserName}</Text>
                : <Text style={styles.invitePending}>{t('booking.invites.pending')}</Text>}
            </View>
            <TouchableOpacity onPress={() => confirmRevoke(item)}>
              <Text style={styles.revokeBtn}>{t('booking.invites.revoke')}</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  subtitle: { color: '#666', fontSize: 14, paddingHorizontal: 16, paddingBottom: 16 },
  form: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8 },
  error: { color: '#dc2626', fontSize: 13, marginBottom: 8 },
  inviteBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 12, alignItems: 'center' },
  inviteBtnText: { color: '#fff', fontWeight: '700' },
  list: { paddingHorizontal: 16 },
  empty: { color: '#888', textAlign: 'center', marginTop: 24 },
  inviteRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8 },
  inviteInfo: { flex: 1 },
  inviteEmail: { fontWeight: '600', fontSize: 15, color: '#1e293b' },
  inviteUser: { fontSize: 13, color: '#16a34a', marginTop: 2 },
  invitePending: { fontSize: 13, color: '#f59e0b', marginTop: 2 },
  revokeBtn: { color: '#dc2626', fontWeight: '600', fontSize: 13 },
});
