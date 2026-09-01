import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Animated
} from 'react-native';
import { api, getAuthState } from '../services/api';

export default function DashboardScreen({ navigation }) {
  const [userName, setUserName] = useState('User');
  const [safetyScore, setSafetyScore] = useState(94);
  const [zoneLabel, setZoneLabel] = useState('Safe Zone');
  const [telemetryStatus, setTelemetryStatus] = useState('Normal Walking');
  const [gforce, setGforce] = useState(1.0);
  const [speed, setSpeed] = useState(1.2);

  // Pulse animation for SOS button
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Start pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fetch user profile
    loadUser();
  }, []);

  const loadUser = async () => {
    const { phone } = getAuthState();
    if (phone) {
      try {
        const profile = await api.getProfile(phone);
        if (profile && profile.full_name) {
          setUserName(profile.full_name);
        }
      } catch (e) {
        // fallback
      }
    }
  };

  const handleSimulateFall = async () => {
    setGforce(3.2);
    setTelemetryStatus('Fall Suspected (Auto-SOS)');
    try {
      const res = await api.sendBehaviorTelemetry(1.2, 3.2);
      Alert.alert(
        '⚠️ Anomaly Detected',
        `Gait Status: ${res.status}\n${res.details}\n\nActivating emergency protocols!`,
        [
          { text: 'View SOS Stream', onPress: () => navigation.navigate('SOS') },
          { text: 'I am Safe', style: 'cancel', onPress: () => setGforce(1.0) }
        ]
      );
    } catch (e) {
      navigation.navigate('SOS');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back, {userName}</Text>
            <Text style={styles.subtitle}>Secured by Aegis AI & IoT Network</Text>
          </View>
          <TouchableOpacity
            style={styles.profileIconBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIconText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* SOS Panic Trigger Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }], marginVertical: 20 }}>
          <TouchableOpacity
            style={styles.sosButton}
            onPress={() => navigation.navigate('SOS')}
            activeOpacity={0.85}
          >
            <View style={styles.innerSos}>
              <Text style={styles.sosText}>SOS</Text>
              <Text style={styles.sosSubtext}>ONE-TOUCH ALARM</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Live Safety Index Panel */}
        <View style={styles.safetyCard}>
          <Text style={styles.cardHeader}>Live Area Safety Index</Text>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreNumber, { color: '#00E676' }]}>{safetyScore}%</Text>
            <View style={styles.scoreTextGroup}>
              <Text style={styles.scoreTitle}>{zoneLabel}</Text>
              <Text style={styles.scoreSub}>High illumination • 82% CCTV coverage</Text>
            </View>
          </View>
        </View>

        {/* Actions Grid */}
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('Map')}
          >
            <Text style={styles.cardEmoji}>🗺️</Text>
            <Text style={styles.cardTitle}>Safe Routes</Text>
            <Text style={styles.cardDesc}>Evaluate lit paths in India</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('Chatbot')}
          >
            <Text style={styles.cardEmoji}>🤖</Text>
            <Text style={styles.cardTitle}>AI Assistant</Text>
            <Text style={styles.cardDesc}>Gemini safety guide</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.cardEmoji}>👥</Text>
            <Text style={styles.cardTitle}>Contacts Circle</Text>
            <Text style={styles.cardDesc}>Emergency SMS links</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('FakeCall')}
          >
            <Text style={styles.cardEmoji}>📞</Text>
            <Text style={styles.cardTitle}>Fake Escape Call</Text>
            <Text style={styles.cardDesc}>Schedule escape ring</Text>
          </TouchableOpacity>
        </View>

        {/* Kinematic Telemetry Test Card */}
        <View style={styles.telemetryCard}>
          <Text style={styles.telemetryHeader}>Kinematic Sensor Anomaly Tester</Text>
          <Text style={styles.telemetrySub}>
            Simulate sudden fall or rapid acceleration to test automated SOS arming.
          </Text>
          <TouchableOpacity
            style={styles.fallSimBtn}
            onPress={handleSimulateFall}
          >
            <Text style={styles.fallSimText}>💥 Simulate Fall / High Impact</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E9E',
    marginTop: 2,
  },
  profileIconBtn: {
    backgroundColor: '#1E1E2C',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  profileIconText: {
    fontSize: 20,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FF1744',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
  },
  innerSos: {
    alignItems: 'center',
  },
  sosText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  sosSubtext: {
    fontSize: 10,
    color: '#FFE0E6',
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  safetyCard: {
    alignSelf: 'stretch',
    backgroundColor: '#1E1E2C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  cardHeader: {
    fontSize: 13,
    color: '#8E8E9E',
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 34,
    fontWeight: 'bold',
    marginRight: 14,
  },
  scoreTextGroup: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scoreSub: {
    fontSize: 12,
    color: '#8E8E9E',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginBottom: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#1E1E2C',
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  cardEmoji: {
    fontSize: 26,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardDesc: {
    fontSize: 11,
    color: '#8E8E9E',
    marginTop: 2,
  },
  telemetryCard: {
    alignSelf: 'stretch',
    backgroundColor: '#1E1E2C',
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  telemetryHeader: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  telemetrySub: {
    color: '#8E8E9E',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  fallSimBtn: {
    backgroundColor: 'rgba(255, 74, 107, 0.15)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF4A6B',
  },
  fallSimText: {
    color: '#FF4A6B',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
