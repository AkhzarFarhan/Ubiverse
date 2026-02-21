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

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'notes'),
      orderBy('updatedAt', 'desc'),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const openNew = () => {
    setEditingNote(null);
    setTitle('');
    setBody('');
    setModalVisible(true);
  };

  const openEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setBody(note.body);
    setModalVisible(true);
  };

  const saveNote = async () => {
    if (!title.trim() && !body.trim()) return;
    try {
      if (editingNote) {
        await updateDoc(doc(db, 'users', user.uid, 'notes', editingNote.id), {
          title: title.trim(),
          body: body.trim(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'users', user.uid, 'notes'), {
          title: title.trim(),
          body: body.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Could not save note.');
    }
  };

  const deleteNote = async (id) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', user.uid, 'notes', id));
          } catch (error) {
            Alert.alert('Error', 'Could not delete note.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => openEdit(item)}
      testID={`note-${item.id}`}
    >
      <Text style={styles.noteTitle} numberOfLines={1}>
        {item.title || 'Untitled'}
      </Text>
      <Text style={styles.noteBody} numberOfLines={2}>
        {item.body || 'No content'}
      </Text>
      <View style={styles.noteFooter}>
        <Text style={styles.noteDate}>
          {item.updatedAt?.toDate().toLocaleDateString() || ''}
        </Text>
        <TouchableOpacity
          onPress={() => deleteNote(item.id)}
          testID={`note-delete-${item.id}`}
        >
          <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Notes</Text>
        <TouchableOpacity style={styles.addButton} onPress={openNew} testID="add-note-button">
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#00C9A7" />
      ) : (
        <FlatList
          data={notes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color="#B0E8E0" />
              <Text style={styles.emptyText}>No notes yet — create one!</Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flex}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingNote ? 'Edit Note' : 'New Note'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#888" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                placeholderTextColor="#B0A8C8"
                value={title}
                onChangeText={setTitle}
                testID="note-title-input"
              />
              <TextInput
                style={styles.bodyInput}
                placeholder="Write your note…"
                placeholderTextColor="#B0A8C8"
                value={body}
                onChangeText={setBody}
                multiline
                textAlignVertical="top"
                testID="note-body-input"
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={saveNote}
                testID="save-note-button"
              >
                <Text style={styles.saveText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7FFFD' },
  flex: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A2E' },
  addButton: {
    backgroundColor: '#00C9A7',
    borderRadius: 14,
    padding: 12,
  },
  loader: { marginTop: 40 },
  list: { padding: 12, paddingBottom: 24 },
  columnWrapper: { gap: 12 },
  noteCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#00C9A7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 100,
  },
  noteTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 6 },
  noteBody: { fontSize: 13, color: '#666', flex: 1 },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  noteDate: { fontSize: 11, color: '#AAA' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 15, color: '#A0D8D0', marginTop: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A2E' },
  titleInput: {
    backgroundColor: '#F0FDF9',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C0EDE6',
  },
  bodyInput: {
    backgroundColor: '#F0FDF9',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1A1A2E',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C0EDE6',
    minHeight: 160,
  },
  saveBtn: {
    backgroundColor: '#00C9A7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
