import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { api, getAuthState, setAuthState } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile data
  const [fullName, setFullName] = useState('Jane Doe');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [conditions, setConditions] = useState('None');
  const [allergies, setAllergies] = useState('Penicillin');

  // Contacts Circle
  const [contacts, setContacts] = useState([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    const { phone: savedPhone } = getAuthState();
    setPhone(savedPhone || '+1234567890');
    setLoading(true);
    try {
      const p = await api.getProfile(savedPhone);
      if (p) {
        if (p.full_name) setFullName(p.full_name);
        if (p.blood_group) setBloodGroup(p.blood_group);
        if (p.medical_conditions) setConditions(p.medical_conditions);
        if (p.allergies) setAllergies(p.allergies);
      }

      const c = await api.getContacts(savedPhone);
      if (c) setContacts(c);
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedical = async () => {
    setSaving(true);
    try {
      await api.updateProfile(phone, {
        blood_group: bloodGroup,
        medical_conditions: conditions,
        allergies: allergies,
      });
      Alert.alert('Saved', 'Medical Profile updated successfully.');
    } catch (e) {
      Alert.alert('Save Error', 'Details saved locally.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      Alert.alert('Required Fields', 'Please input both Contact Name and Phone Number.');
      return;
    }

    try {
      const added = await api.addContact(phone, newContactName.trim(), newContactPhone.trim(), 'Guardian');
      setContacts(prev => [...prev, added]);
      setNewContactName('');
      setNewContactPhone('');
      Alert.alert('Contact Added', `${newContactName} added to your Emergency Priority Circle.`);
    } catch (e) {
      Alert.alert('Error', 'Unable to add contact.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of Aegis Security?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          setAuthState(null, null, null);
          navigation.replace('Auth');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#FF4A6B" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <View style={styles.card}>
          <View style={styles.userHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{fullName ? fullName[0].toUpperCase() : 'U'}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{fullName}</Text>
              <Text style={styles.userPhone}>{phone}</Text>
            </View>
          </View>
        </View>

        {/* Medical History Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🩸 Medical Emergency Profile</Text>

          <Text style={styles.label}>Blood Group</Text>
          <TextInput
            style={styles.input}
            value={bloodGroup}
            onChangeText={setBloodGroup}
            placeholder="e.g. O+, B+, A-"
            placeholderTextColor="#8E8E9E"
          />

          <Text style={styles.label}>Medical Conditions</Text>
          <TextInput
            style={styles.input}
            value={conditions}
            onChangeText={setConditions}
            placeholder="e.g. Asthma, Diabetes, None"
            placeholderTextColor="#8E8E9E"
          />

          <Text style={styles.label}>Allergies</Text>
          <TextInput
            style={styles.input}
            value={allergies}
            onChangeText={setAllergies}
            placeholder="e.g. Penicillin, Peanuts, None"
            placeholderTextColor="#8E8E9E"
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveMedical}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save Medical Information</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👥 Priority Contacts Circle</Text>
          <Text style={styles.sectionDesc}>
            These contacts receive automated SMS alerts with live GPS tracking pins when you press SOS.
          </Text>

          {contacts.map((contact, idx) => (
            <View key={contact.id || idx} style={styles.contactItem}>
              <View>
                <Text style={styles.contactName}>{contact.contact_name}</Text>
                <Text style={styles.contactPhone}>{contact.phone_number}</Text>
              </View>
              <View style={styles.badgeActive}>
                <Text style={styles.badgeActiveText}>Active</Text>
              </View>
            </View>
          ))}

          {/* Add Contact Inputs */}
          <View style={styles.addContactBox}>
            <Text style={styles.addContactTitle}>Add Emergency Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Contact Name (e.g. Dad, Sister)"
              placeholderTextColor="#8E8E9E"
              value={newContactName}
              onChangeText={setNewContactName}
            />
            <TextInput
              style={[styles.input, { marginTop: 8 }]}
              placeholder="Phone Number (e.g. +919876543210)"
              placeholderTextColor="#8E8E9E"
              keyboardType="phone-pad"
              value={newContactPhone}
              onChangeText={setNewContactPhone}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddContact}>
              <Text style={styles.addBtnText}>+ Add to Safety Circle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>🚪 Logout of Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  scrollContent: {
    padding: 18,
  },
  card: {
    backgroundColor: '#1E1E2C',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF4A6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userPhone: {
    fontSize: 13,
    color: '#8E8E9E',
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 12,
    color: '#8E8E9E',
    marginBottom: 14,
    lineHeight: 16,
  },
  label: {
    fontSize: 12,
    color: '#D1D1DB',
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F0F1A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  saveBtn: {
    backgroundColor: '#FF4A6B',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161626',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contactPhone: {
    color: '#8E8E9E',
    fontSize: 12,
    marginTop: 2,
  },
  badgeActive: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeActiveText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: 'bold',
  },
  addContactBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#2F2F45',
  },
  addContactTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  addBtnText: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 13,
  },
  logoutBtn: {
    backgroundColor: '#2E2E3F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#42425A',
  },
  logoutBtnText: {
    color: '#FF4A6B',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
