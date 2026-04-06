import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSupplierDetail } from '../../hooks/useSuppliers';
import { useAuth } from '../../context/AuthContext';

function StarRating({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#f59e0b' : '#d1d5db' }}>★</Text>
      ))}
    </View>
  );
}

export default function SupplierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { supplier, loading, claim } = useSupplierDetail(id);

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (!supplier) return <Text style={styles.error}>{t('suppliers.notFound')}</Text>;

  const reviews = (supplier as any).supplier_reviews ?? [];
  const canClaim = supplier.status === 'approved' && !supplier.claimedBy && !!user;
  const isOwner = supplier.claimedBy === user?.id;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.name}>{supplier.name}</Text>
          {supplier.claimedBy && <Text style={styles.verifiedBadge}>{t('suppliers.verified')}</Text>}
        </View>

        {/* Categories */}
        <View style={styles.categories}>
          {supplier.categories.map(cat => (
            <Text key={cat} style={styles.catBadge}>{t(`suppliers.categories.${cat}`)}</Text>
          ))}
        </View>

        {/* Rating summary */}
        {supplier.reviewCount > 0 && (
          <View style={styles.ratingRow}>
            <StarRating rating={supplier.averageRating} />
            <Text style={styles.ratingText}>{supplier.averageRating.toFixed(1)} · {supplier.reviewCount} {t('suppliers.reviews')}</Text>
          </View>
        )}
      </View>

      {/* Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('suppliers.contact')}</Text>
        {supplier.phone && (
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${supplier.phone}`)}>
            <Text style={styles.contactLink}>📞 {supplier.phone}</Text>
          </TouchableOpacity>
        )}
        {supplier.email && (
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${supplier.email}`)}>
            <Text style={styles.contactLink}>✉️ {supplier.email}</Text>
          </TouchableOpacity>
        )}
        {supplier.website && (
          <TouchableOpacity onPress={() => Linking.openURL(supplier.website!)}>
            <Text style={styles.contactLink}>🌐 {supplier.website}</Text>
          </TouchableOpacity>
        )}
        {supplier.serviceAreas.length > 0 && (
          <Text style={styles.serviceAreas}>📍 {supplier.serviceAreas.join(', ')}</Text>
        )}
      </View>

      {/* Description */}
      {(supplier.description?.en || supplier.description?.no) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('suppliers.about')}</Text>
          <Text style={styles.description}>{supplier.description.en || supplier.description.no}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {canClaim && (
          <TouchableOpacity style={[styles.actionBtn, styles.claimBtn]} onPress={claim}>
            <Text style={styles.actionBtnText}>{t('suppliers.claimProfile')}</Text>
          </TouchableOpacity>
        )}
        {supplier.status === 'approved' && user && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.reviewBtn]}
            onPress={() => router.push(`/suppliers/${id}/review`)}
          >
            <Text style={styles.actionBtnText}>{t('suppliers.writeReview')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reviews */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('suppliers.reviews')} ({reviews.length})</Text>
        {reviews.length === 0 && <Text style={styles.empty}>{t('suppliers.noReviews')}</Text>}
        {reviews.map((r: any) => (
          <View key={r.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <StarRating rating={r.rating} size={14} />
              {r.job_date && <Text style={styles.reviewDate}>{r.job_date}</Text>}
            </View>
            {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
            {r.supplier_replies?.[0] && (
              <View style={styles.replyBlock}>
                <Text style={styles.replyLabel}>{t('suppliers.ownerReply')}:</Text>
                <Text style={styles.replyText}>{r.supplier_replies[0].comment}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center' },
  error: { color: '#dc2626', textAlign: 'center', marginTop: 32 },
  header: { backgroundColor: '#fff', padding: 20, marginBottom: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold', flex: 1 },
  verifiedBadge: { fontSize: 12, color: '#16a34a', backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  catBadge: { fontSize: 13, color: '#2563eb', backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingText: { color: '#666', fontSize: 14 },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  contactLink: { color: '#2563eb', fontSize: 15, marginBottom: 8 },
  serviceAreas: { color: '#666', fontSize: 14, marginTop: 4 },
  description: { color: '#444', lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  actionBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  claimBtn: { backgroundColor: '#16a34a' },
  reviewBtn: { backgroundColor: '#2563eb' },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  empty: { color: '#888', textAlign: 'center', paddingVertical: 12 },
  reviewCard: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12, marginTop: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reviewDate: { color: '#888', fontSize: 12 },
  reviewComment: { color: '#444', lineHeight: 20 },
  replyBlock: { marginTop: 10, backgroundColor: '#f9fafb', padding: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#2563eb' },
  replyLabel: { fontWeight: '600', fontSize: 12, color: '#2563eb', marginBottom: 4 },
  replyText: { color: '#444', fontSize: 13 },
});
