import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!displayName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, displayName.trim());
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#6B4EFF', '#A855F7']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>🌐 Ubiverse</Text>
            <Text style={styles.tagline}>Create your account</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Get started</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#B0A8C8"
              value={displayName}
              onChangeText={setDisplayName}
              testID="name-input"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#B0A8C8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              testID="email-input"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#B0A8C8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              testID="password-input"
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#B0A8C8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              testID="confirm-password-input"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              testID="register-button"
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>
                Already have an account? <Text style={styles.linkBold}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 36, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A2E', marginBottom: 24 },
  input: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1A1A2E',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8E4FF',
  },
  button: {
    backgroundColor: '#6B4EFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  link: { textAlign: 'center', color: '#888', fontSize: 14 },
  linkBold: { color: '#6B4EFF', fontWeight: '700' },
});
