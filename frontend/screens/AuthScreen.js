import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { api, setAuthState } from '../services/api';

export default function AuthScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');

  const handleRegister = async () => {
    if (!fullName.trim() || !phone.trim() || !password) {
      Alert.alert('Required Fields', 'Please enter your Full Name, Phone Number, and Password.');
      return;
    }
    if (fullName.trim().length < 3) {
      Alert.alert('Invalid Name', 'Full Name must be at least 3 characters long.');
      return;
    }
    const phoneRegex = /^\+?[0-9]{10,14}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number (at least 10 digits).');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      await api.register(phone, fullName, email, password);
      setPendingPhone(phone.trim());
      setShowOtpModal(true);
    } catch (e) {
      Alert.alert('Registration Error', e.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      Alert.alert('OTP Required', 'Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      await api.verifyOtp(pendingPhone, otpCode);
      setShowOtpModal(false);
      Alert.alert('Account Verified', 'Welcome to Aegis Women Safety System!', [
        { text: 'Continue', onPress: () => navigation.replace('Dashboard') }
      ]);
    } catch (e) {
      Alert.alert('Verification Error', e.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phone.trim() || !password) {
      Alert.alert('Required Fields', 'Please enter your registered Phone Number and Password.');
      return;
    }
    setLoading(true);
    try {
      await api.login(phone, password);
      navigation.replace('Dashboard');
    } catch (e) {
      Alert.alert('Login Failed', e.message || 'Incorrect credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Brand Header */}
          <View style={styles.brandBox}>
            <Text style={styles.shieldIcon}>🛡️</Text>
            <Text style={styles.brandTitle}>AEGIS SECURITY</Text>
            <Text style={styles.brandSubtitle}>Intelligent Women Safety & Defense System</Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tabButton, isLogin && styles.activeTab]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, !isLogin && styles.activeTab]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {!isLogin && (
              <>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Jane Doe"
                  placeholderTextColor="#6E6E85"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </>
            )}

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +919876543210"
              placeholderTextColor="#6E6E85"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {!isLogin && (
              <>
                <Text style={styles.label}>Email Address (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. jane@example.com"
                  placeholderTextColor="#6E6E85"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </>
            )}

            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password (min 6 characters)"
              placeholderTextColor="#6E6E85"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {!isLogin && (
              <>
                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor="#6E6E85"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={isLogin ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isLogin ? 'Login Securely' : 'Create Safety Account'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Verification Modal */}
      <Modal visible={showOtpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>📩</Text>
            <Text style={styles.modalTitle}>SMS Verification</Text>
            <Text style={styles.modalDesc}>
              A 6-digit OTP code <Text style={{ color: '#00E676', fontWeight: 'bold' }}>123456</Text> has been simulated to {pendingPhone}.
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="Enter OTP (123456)"
              placeholderTextColor="#6E6E85"
              keyboardType="number-pad"
              maxLength={6}
              value={otpCode}
              onChangeText={setOtpCode}
            />

            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.verifyBtnText}>Verify & Activate</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelModalBtn}
              onPress={() => setShowOtpModal(false)}
            >
              <Text style={styles.cancelModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  shieldIcon: {
    fontSize: 42,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#8E8E9E',
    marginTop: 4,
    textAlign: 'center',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#1E1E2C',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FF4A6B',
  },
  tabText: {
    color: '#8E8E9E',
    fontWeight: '700',
    fontSize: 14,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1E1E2C',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  label: {
    color: '#D1D1DB',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#0F0F1A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  primaryButton: {
    backgroundColor: '#FF4A6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#FF4A6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1E1E2C',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF4A6B',
  },
  modalEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    color: '#8E8E9E',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: '#0F0F1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    width: '100%',
    borderWidth: 1,
    borderColor: '#4A90E2',
    marginBottom: 18,
  },
  verifyBtn: {
    backgroundColor: '#00E676',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  verifyBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
  },
  cancelModalBtn: {
    paddingVertical: 8,
  },
  cancelModalText: {
    color: '#8E8E9E',
    fontSize: 13,
  },
});
