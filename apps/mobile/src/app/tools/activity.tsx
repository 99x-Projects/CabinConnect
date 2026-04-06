import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMyToolActivity } from '../../hooks/useTools';
import type { BorrowRequest } from '@cabinconnect/shared';

const STATUS_COLOR: Record<string, string> = {
  pending: '#d97706', approved: '#16a34a', rejected: '#dc2626', returned: '#888',
};

export default function ToolActivityScreen() {
  const { t } = useTranslation();
  const { listings, incomingRequests, myRequests, loading, updateRequestStatus } = useMyToolActivity();

  if (loading) return <ActivityIndicator style={styles.center} />;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={[]}
      ListHeaderComponent={
        <>
          {/* Incoming requests for my tools */}
          <Text style={styles.sectionTitle}>{t('toolshare.activity.incomingRequests')} ({incomingRequests.filter(r => r.status === 'pending').length})</Text>
          {incomingRequests.length === 0
            ? <Text style={styles.empty}>{t('toolshare.activity.noIncoming')}</Text>
            : incomingRequests.map(r => (
              <RequestCard
                key={r.id}
                request={r}
                isOwner
                onApprove={() => updateRequestStatus(r.id, 'approved')}
                onReject={() => updateRequestStatus(r.id, 'rejected')}
                onReturn={() => updateRequestStatus(r.id, 'returned')}
              />
            ))
          }

          {/* My borrow requests */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('toolshare.activity.myRequests')} ({myRequests.length})</Text>
          {myRequests.length === 0
            ? <Text style={styles.empty}>{t('toolshare.activity.noRequests')}</Text>
            : myRequests.map(r => <RequestCard key={r.id} request={r} />)
          }

          {/* My listings */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('toolshare.activity.myListings')} ({listings.length})</Text>
          {listings.length === 0
            ? <Text style={styles.empty}>{t('toolshare.activity.noListings')}</Text>
            : listings.map(tool => (
              <View key={tool.id} style={styles.listingCard}>
                <Text style={styles.listingName}>{tool.name}</Text>
                <View style={[styles.availBadge, !tool.available && styles.unavailBadge]}>
                  <Text style={[styles.availText, !tool.available && styles.unavailText]}>
                    {tool.available ? t('toolshare.available') : t('toolshare.unavailable')}
                  </Text>
                </View>
              </View>
            ))
          }
        </>
      }
      renderItem={() => null}
    />
  );
}

function RequestCard({ request, isOwner, onApprove, onReject, onReturn }: {
  request: BorrowRequest;
  isOwner?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onReturn?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestTool}>{request.toolName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[request.status] + '22' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLOR[request.status] }]}>
            {t(`toolshare.status.${request.status}`)}
          </Text>
        </View>
      </View>
      <Text style={styles.requestMeta}>
        {isOwner ? `${t('toolshare.from')} ${request.requesterName}` : `${t('toolshare.to')} owner`}
        {' · '}{request.startDate} → {request.endDate}
      </Text>
      {request.message && <Text style={styles.requestMsg}>{request.message}</Text>}
      {isOwner && request.status === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.approveBtn} onPress={onApprove}>
            <Text style={styles.approveBtnText}>{t('toolshare.approve')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
            <Text style={styles.rejectBtnText}>{t('toolshare.reject')}</Text>
          </TouchableOpacity>
        </View>
      )}
      {isOwner && request.status === 'approved' && (
        <TouchableOpacity style={styles.returnBtn} onPress={onReturn}>
          <Text style={styles.returnBtnText}>{t('toolshare.markReturned')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 10 },
  empty: { color: '#888', marginBottom: 12 },
  requestCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10 },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  requestTool: { fontWeight: '600', fontSize: 15, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '600' },
  requestMeta: { color: '#888', fontSize: 13, marginBottom: 4 },
  requestMsg: { color: '#555', fontSize: 13, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  approveBtn: { flex: 1, backgroundColor: '#16a34a', borderRadius: 8, padding: 10, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: '600' },
  rejectBtn: { flex: 1, backgroundColor: '#fef2f2', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#dc2626' },
  rejectBtnText: { color: '#dc2626', fontWeight: '600' },
  returnBtn: { marginTop: 10, backgroundColor: '#f0f9ff', borderRadius: 8, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#2563eb' },
  returnBtnText: { color: '#2563eb', fontWeight: '600' },
  listingCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listingName: { fontWeight: '600', fontSize: 15, flex: 1 },
  availBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  unavailBadge: { backgroundColor: '#fef2f2' },
  availText: { color: '#16a34a', fontSize: 12, fontWeight: '600' },
  unavailText: { color: '#dc2626' },
});
