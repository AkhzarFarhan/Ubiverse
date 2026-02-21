import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

const TODAY = new Date().toISOString().split('T')[0];

export default function HabitsScreen() {
  const [habits, setHabits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitEmoji, setHabitEmoji] = useState('⭐');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'habits'),
      orderBy('createdAt', 'asc'),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHabits(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const addHabit = async () => {
    const trimmed = habitName.trim();
    if (!trimmed) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'habits'), {
        name: trimmed,
        emoji: habitEmoji,
        completedDates: [],
        createdAt: serverTimestamp(),
      });
      setHabitName('');
      setHabitEmoji('⭐');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Could not add habit.');
    }
  };

  const toggleToday = async (id, completedDates = []) => {
    const updated = completedDates.includes(TODAY)
      ? completedDates.filter((d) => d !== TODAY)
      : [...completedDates, TODAY];
    try {
      await updateDoc(doc(db, 'users', user.uid, 'habits', id), {
        completedDates: updated,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not update habit.');
    }
  };

  const deleteHabit = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'habits', id));
    } catch (error) {
      Alert.alert('Error', 'Could not delete habit.');
    }
  };

  const streak = (completedDates = []) => {
    let count = 0;
    let date = new Date();
    while (true) {
      const key = date.toISOString().split('T')[0];
      if (!completedDates.includes(key)) break;
      count++;
      date.setDate(date.getDate() - 1);
    }
    return count;
  };

  const renderItem = ({ item }) => {
    const doneToday = item.completedDates?.includes(TODAY);
    const currentStreak = streak(item.completedDates);
    return (
      <View style={styles.item}>
        <TouchableOpacity
          onPress={() => toggleToday(item.id, item.completedDates)}
          style={[styles.emojiBtn, doneToday && styles.emojiBtnDone]}
          testID={`habit-toggle-${item.id}`}
        >
          <Text style={styles.emoji}>{item.emoji}</Text>
        </TouchableOpacity>
        <View style={styles.itemInfo}>
          <Text style={styles.habitName}>{item.name}</Text>
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={14} color="#FF8E53" />
            <Text style={styles.streakText}>{currentStreak} day streak</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => deleteHabit(item.id)} testID={`habit-delete-${item.id}`}>
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Habits</Text>
          <Text style={styles.subtitle}>
            {habits.filter((h) => h.completedDates?.includes(TODAY)).length}/{habits.length} done today
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          testID="add-habit-button"
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#FF6B6B" />
      ) : (
        <FlatList
          data={habits}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="flame-outline" size={48} color="#FFD0C8" />
              <Text style={styles.emptyText}>No habits yet — start building!</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>New Habit</Text>
              <TextInput
                style={styles.input}
                placeholder="Habit name (e.g. Meditate)"
                placeholderTextColor="#B0A8C8"
                value={habitName}
                onChangeText={setHabitName}
                testID="habit-name-input"
              />
              <TextInput
                style={styles.input}
                placeholder="Emoji (e.g. 🧘)"
                placeholderTextColor="#B0A8C8"
                value={habitEmoji}
                onChangeText={setHabitEmoji}
                testID="habit-emoji-input"
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={addHabit} testID="save-habit-button">
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F7' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A2E' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 4 },
  addButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 14,
    padding: 12,
  },
  loader: { marginTop: 40 },
  list: { padding: 16, paddingBottom: 24 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFF0EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#FFD0C8',
  },
  emojiBtnDone: {
    backgroundColor: '#FFE8E6',
    borderColor: '#FF6B6B',
  },
  emoji: { fontSize: 24 },
  itemInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '600', color: '#1A1A2E' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  streakText: { fontSize: 12, color: '#888' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 15, color: '#FFAAA0', marginTop: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A2E', marginBottom: 20 },
  input: {
    backgroundColor: '#FFF0EE',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1A1A2E',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFD0C8',
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelText: { color: '#888', fontWeight: '600' },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontWeight: '700' },
});
