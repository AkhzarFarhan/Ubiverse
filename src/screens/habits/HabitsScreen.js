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
    const date = new Date();
    const MAX_STREAK = 365;
    while (count < MAX_STREAK) {
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
            <Ionicons name="flame" size={14} color="#FF9500" />
            <Text style={styles.streakText}>{currentStreak} {currentStreak === 1 ? 'day' : 'days'} streak</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => deleteHabit(item.id)} testID={`habit-delete-${item.id}`}>
          <Ionicons name="trash-outline" size={20} color="#007AFF" />
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
        <ActivityIndicator style={styles.loader} size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={habits}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="flame-outline" size={48} color="#C6C6C8" />
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
                placeholderTextColor="#8E8E93"
                value={habitName}
                onChangeText={setHabitName}
                testID="habit-name-input"
              />
              <TextInput
                style={styles.input}
                placeholder="Emoji (e.g. 🧘)"
                placeholderTextColor="#8E8E93"
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
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#000' },
  subtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 12,
  },
  loader: { marginTop: 40 },
  list: { padding: 16, paddingBottom: 24 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  emojiBtnDone: {
    backgroundColor: '#E5F1FF',
    borderColor: '#007AFF',
  },
  emoji: { fontSize: 24 },
  itemInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '600', color: '#000' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  streakText: { fontSize: 12, color: '#8E8E93' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 15, color: '#8E8E93', marginTop: 12 },
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
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 20 },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#000',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  cancelText: { color: '#8E8E93', fontWeight: '600' },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontWeight: '700' },
});
