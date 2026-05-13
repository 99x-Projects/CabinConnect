import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useCabins } from '../../hooks/useCabin';

export default function NewCabinScreen() {
  const { create } = useCabins();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [resort, setResort] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [sizeM2, setSizeM2] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!name.trim()) { setError('Cabin name is required'); return; }
    if (!address.trim()) { setError('Address is required'); return; }
    setError('');
    setLoading(true);
    try {
      const cabin = await create({
        name: name.trim(),
        address: address.trim(),
        resort: resort.trim() || undefined,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
        sizeM2: sizeM2 ? parseFloat(sizeM2) : undefined,
        yearBuilt: yearBuilt ? parseInt(yearBuilt, 10) : undefined,
      });
      router.replace(`/cabin/${cabin.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create cabin');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Add Cabin</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Cabin Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Mountain Lodge" />

      <Text style={styles.label}>Address *</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Full address" />

      <Text style={styles.label}>Resort / Area</Text>
      <TextInput style={styles.input} value={resort} onChangeText={setResort} placeholder="e.g. Hemsedal" />

      <Text style={styles.label}>Bedrooms</Text>
      <TextInput style={styles.input} value={bedrooms} onChangeText={setBedrooms} placeholder="3" keyboardType="number-pad" />

      <Text style={styles.label}>Size (m²)</Text>
      <TextInput style={styles.input} value={sizeM2} onChangeText={setSizeM2} placeholder="120" keyboardType="decimal-pad" />

      <Text style={styles.label}>Year Built</Text>
      <TextInput style={styles.input} value={yearBuilt} onChangeText={setYearBuilt} placeholder="2005" keyboardType="number-pad" />

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Cabin</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancel} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#444', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 15 },
  button: { backgroundColor: '#2563eb', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancel: { padding: 16, alignItems: 'center', marginTop: 8 },
  cancelText: { color: '#888', fontSize: 15 },
  error: { color: '#dc2626', marginBottom: 16 },
});
