import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCabinDetail } from '../../../hooks/useCabin';

export default function InstructionsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { instructions, loading, saveInstructions } = useCabinDetail(id);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    accessCode: '', wifiName: '', wifiPassword: '',
    parkingInfo: '', houseRules: '', checkInInfo: '', checkOutInfo: '',
  });

  useEffect(() => {
    if (instructions) {
      setForm({
        accessCode: instructions.accessCode ?? '',
        wifiName: instructions.wifiName ?? '',
        wifiPassword: instructions.wifiPassword ?? '',
        parkingInfo: instructions.parkingInfo ?? '',
        houseRules: instructions.houseRules ?? '',
        checkInInfo: instructions.checkInInfo ?? '',
        checkOutInfo: instructions.checkOutInfo ?? '',
      });
    }
  }, [instructions]);

  async function handleSave() {
    setSaving(true);
    try {
      await saveInstructions({
        accessCode: form.accessCode || undefined,
        wifiName: form.wifiName || undefined,
        wifiPassword: form.wifiPassword || undefined,
        parkingInfo: form.parkingInfo || undefined,
        houseRules: form.houseRules || undefined,
        checkInInfo: form.checkInInfo || undefined,
        checkOutInfo: form.checkOutInfo || undefined,
        emergencyContacts: instructions?.emergencyContacts ?? [],
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <ActivityIndicator style={styles.center} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('cabin.instructions.title')}</Text>

      <Field label={t('cabin.instructions.accessCode')} value={form.accessCode} onChangeText={v => setForm(p => ({ ...p, accessCode: v }))} />
      <Field label={t('cabin.instructions.wifiName')} value={form.wifiName} onChangeText={v => setForm(p => ({ ...p, wifiName: v }))} />
      <Field label={t('cabin.instructions.wifiPassword')} value={form.wifiPassword} onChangeText={v => setForm(p => ({ ...p, wifiPassword: v }))} secureTextEntry />
      <Field label={t('cabin.instructions.parking')} value={form.parkingInfo} onChangeText={v => setForm(p => ({ ...p, parkingInfo: v }))} multiline />
      <Field label={t('cabin.instructions.checkIn')} value={form.checkInInfo} onChangeText={v => setForm(p => ({ ...p, checkInInfo: v }))} multiline />
      <Field label={t('cabin.instructions.checkOut')} value={form.checkOutInfo} onChangeText={v => setForm(p => ({ ...p, checkOutInfo: v }))} multiline />
      <Field label={t('cabin.instructions.houseRules')} value={form.houseRules} onChangeText={v => setForm(p => ({ ...p, houseRules: v }))} multiline />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? t('common.saving') : t('common.save')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, value, onChangeText, multiline, secureTextEntry }: {
  label: string; value: string; onChangeText: (v: string) => void; multiline?: boolean; secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textarea]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 6, color: '#333' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 },
  textarea: { height: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
