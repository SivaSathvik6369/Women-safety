import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, SafeAreaView } from 'react-native';

export default function SOSScreen({ navigation }) {
  const [timer, setTimer] = useState(0);
  const [pulse, setPulse] = useState(true);

  // Simulate pulse animation state
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulse(p => !p);
    }, 1000);

    const timerInterval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);

    return () => {
      clearInterval(pulseInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const handleDeactivate = () => {
    Alert.alert(
      "Deactivate Alarm",
      "Are you sure you want to stop the SOS and log safety status?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm Safe", 
          onPress: () => {
            // Log status resolution and return to dashboard
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, pulse ? styles.redBG : styles.darkBG]}>
      <View style={styles.alertHeader}>
        <Text style={styles.alertTitle}>ALARM ACTIVE</Text>
        <Text style={styles.alertDuration}>SOS Stream: {timer}s</Text>
      </View>

      {/* Sensor / Feed Monitoring Metrics */}
      <View style={styles.monitoringCard}>
        <Text style={styles.sectionTitle}>🔴 Real-time Evidence Vault</Text>
        
        <View style={styles.feedRow}>
          <Text style={styles.feedLabel}>Mic Background Recording</Text>
          <Text style={styles.feedStatus}>RECORDING (Noise Reduced)</Text>
        </View>

        <View style={styles.feedRow}>
          <Text style={styles.feedLabel}>Front Video Camera Stream</Text>
          <Text style={styles.feedStatus}>STREAMING (E2E Encrypted)</Text>
        </View>

        <View style={styles.feedRow}>
          <Text style={styles.feedLabel}>Live Location Telemetry</Text>
          <Text style={styles.feedStatus}>DISPATCHING (GPS Loop)</Text>
        </View>

        <View style={styles.feedRow}>
          <Text style={styles.feedLabel}>Emergency Dispatches</Text>
          <Text style={[styles.feedStatus, { color: '#00E676' }]}>SMS SENT • CALL PLACED</Text>
        </View>
      </View>

      {/* Big Cancel Button */}
      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={handleDeactivate}
      >
        <Text style={styles.cancelText}>DEACTIVATE & MARK SAFE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  redBG: {
    backgroundColor: '#3E0A14',
  },
  darkBG: {
    backgroundColor: '#0F0F1A',
  },
  alertHeader: {
    alignItems: 'center',
    marginTop: 40,
  },
  alertTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF1744',
    letterSpacing: 2,
  },
  alertDuration: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '600',
  },
  monitoringCard: {
    backgroundColor: 'rgba(30, 30, 44, 0.95)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FF1744',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  feedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2F2F45',
  },
  feedLabel: {
    color: '#8E8E9E',
    fontSize: 13,
  },
  feedStatus: {
    color: '#FF4A6B',
    fontSize: 13,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#00E676',
    borderRadius: 15,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  cancelText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
