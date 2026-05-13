import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="cabin" options={{ title: 'My Cabin' }} />
      <Tabs.Screen name="events" options={{ title: 'Events' }} />
      <Tabs.Screen name="groceries" options={{ title: 'Groceries' }} />
      <Tabs.Screen name="suppliers" options={{ title: 'Suppliers' }} />
      <Tabs.Screen name="toolshare" options={{ title: 'Tools' }} />
    </Tabs>
  );
}
