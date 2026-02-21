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

export default function TodoScreen() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'todos'),
      orderBy('createdAt', 'desc'),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const addTodo = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    try {
      await addDoc(collection(db, 'users', user.uid, 'todos'), {
        text: trimmed,
        completed: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      Alert.alert('Error', 'Could not add task.');
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      await updateDoc(doc(db, 'users', user.uid, 'todos', id), {
        completed: !completed,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not update task.');
    }
  };

  const deleteTodo = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'todos', id));
    } catch (error) {
      Alert.alert('Error', 'Could not delete task.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <TouchableOpacity
        onPress={() => toggleTodo(item.id, item.completed)}
        style={styles.checkBtn}
        testID={`todo-toggle-${item.id}`}
      >
        <Ionicons
          name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={item.completed ? '#6B4EFF' : '#D0C8FF'}
        />
      </TouchableOpacity>
      <Text style={[styles.itemText, item.completed && styles.itemDone]}>
        {item.text}
      </Text>
      <TouchableOpacity
        onPress={() => deleteTodo(item.id)}
        testID={`todo-delete-${item.id}`}
      >
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Todos</Text>
        <Text style={styles.count}>{todos.filter((t) => !t.completed).length} {todos.filter((t) => !t.completed).length === 1 ? 'task' : 'tasks'} remaining</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color="#6B4EFF" />
        ) : (
          <FlatList
            data={todos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="checkbox-outline" size={48} color="#D0C8FF" />
                <Text style={styles.emptyText}>No tasks yet — add one below!</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a new task…"
            placeholderTextColor="#B0A8C8"
            value={text}
            onChangeText={setText}
            onSubmitEditing={addTodo}
            returnKeyType="done"
            testID="todo-input"
          />
          <TouchableOpacity style={styles.addBtn} onPress={addTodo} testID="todo-add-button">
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  flex: { flex: 1 },
  header: { padding: 24, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A2E' },
  count: { fontSize: 14, color: '#888', marginTop: 4 },
  loader: { marginTop: 40 },
  list: { padding: 16, paddingBottom: 24 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  checkBtn: { marginRight: 12 },
  itemText: { flex: 1, fontSize: 15, color: '#1A1A2E' },
  itemDone: { textDecorationLine: 'line-through', color: '#AAA' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 15, color: '#B0A8C8', marginTop: 12 },
  inputRow: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0EEF8',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#E8E4FF',
  },
  addBtn: {
    backgroundColor: '#6B4EFF',
    borderRadius: 12,
    width: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
