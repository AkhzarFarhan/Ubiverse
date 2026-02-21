import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const tools = [
  {
    icon: 'checkbox-outline',
    label: 'Todos',
    desc: 'Track your tasks',
    color: ['#6B4EFF', '#A855F7'],
    tab: 'Todos',
  },
  {
    icon: 'flame-outline',
    label: 'Habits',
    desc: 'Build daily habits',
    color: ['#FF6B6B', '#FF8E53'],
    tab: 'Habits',
  },
  {
    icon: 'document-text-outline',
    label: 'Notes',
    desc: 'Quick notes & ideas',
    color: ['#00C9A7', '#00B4D8'],
    tab: 'Notes',
  },
];

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
            <Text style={styles.subtitle}>What would you like to do today?</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn} testID="logout-button">
            <Ionicons name="log-out-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Your Tools</Text>
        <View style={styles.grid}>
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.label}
              style={styles.card}
              onPress={() => navigation.navigate(tool.tab)}
              testID={`tool-${tool.label.toLowerCase()}`}
            >
              <LinearGradient colors={tool.color} style={styles.iconWrap}>
                <Ionicons name={tool.icon} size={28} color="#000" />
              </View>
              <Text style={styles.cardLabel}>{tool.label}</Text>
              <Text style={styles.cardDesc}>{tool.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { paddingTop: 20, paddingBottom: 32, paddingHorizontal: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 26, fontWeight: '800', color: '#000', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#3C3C43' },
  logoutBtn: { padding: 8 },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 20,
    width: '46%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#8E8E93' },
});
