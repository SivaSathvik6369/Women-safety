import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert
} from 'react-native';

export default function FakeCallScreen({ navigation }) {
  const [callerName, setCallerName] = useState('Mom (Home)');
  const [delaySeconds, setDelaySeconds] = useState(5);
  const [countingDown, setCountingDown] = useState(false);
  const [countdownLeft, setCountdownLeft] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let timer;
    if (countingDown && countdownLeft > 0) {
      timer = setTimeout(() => {
        setCountdownLeft(prev => prev - 1);
      }, 1000);
    } else if (countingDown && countdownLeft === 0) {
      setCountingDown(false);
      setIsRinging(true);
    }
    return () => clearTimeout(timer);
  }, [countingDown, countdownLeft]);

  useEffect(() => {
    let callTimer;
    if (inCall) {
      callTimer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(callTimer);
  }, [inCall]);

  const handleStartSchedule = () => {
    setCountdownLeft(delaySeconds);
    setCountingDown(true);
    Alert.alert(
      'Escape Call Scheduled',
      `An incoming call from ${callerName} will trigger in ${delaySeconds} seconds. You can lock your screen or keep the app ready.`,
      [{ text: 'OK' }]
    );
  };

  const handleAnswer = () => {
    setIsRinging(false);
    setInCall(true);
    setCallDuration(0);
  };

  const handleDecline = () => {
    setIsRinging(false);
    setInCall(false);
    setCountingDown(false);
  };

  const formatCallTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📞 Fake Escape Call Generator</Text>
          <Text style={styles.headerDesc}>
            Trigger a realistic incoming phone call to gracefully exit uncomfortable, suspicious, or unsafe situations.
          </Text>
        </View>

        {/* Caller Selection */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Select Caller Profile:</Text>
          <View style={styles.optionRow}>
            {['Mom (Home)', 'Dad', 'Boss', 'Police Control'].map(name => (
              <TouchableOpacity
                key={name}
                style={[styles.chip, callerName === name && styles.chipActive]}
                onPress={() => setCallerName(name)}
              >
                <Text style={[styles.chipText, callerName === name && styles.chipTextActive]}>
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Delay Timer Selection */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Trigger Delay:</Text>
          <View style={styles.optionRow}>
            {[
              { label: 'Instant', secs: 1 },
              { label: '5 Secs', secs: 5 },
              { label: '15 Secs', secs: 15 },
              { label: '30 Secs', secs: 30 }
            ].map(item => (
              <TouchableOpacity
                key={item.secs}
                style={[styles.chip, delaySeconds === item.secs && styles.chipActive]}
                onPress={() => setDelaySeconds(item.secs)}
              >
                <Text style={[styles.chipText, delaySeconds === item.secs && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trigger Button */}
        {countingDown ? (
          <View style={styles.countdownBox}>
            <Text style={styles.countdownText}>Ringing in {countdownLeft}s...</Text>
            <TouchableOpacity style={styles.cancelCountBtn} onPress={() => setCountingDown(false)}>
              <Text style={styles.cancelCountText}>Cancel Timer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.scheduleBtn} onPress={handleStartSchedule}>
            <Text style={styles.scheduleBtnText}>🚀 SCHEDULE FAKE CALL</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Simulated Fullscreen Incoming Call Screen */}
      <Modal visible={isRinging} transparent animationType="fade">
        <SafeAreaView style={styles.ringingScreen}>
          <View style={styles.ringingTop}>
            <Text style={styles.incomingLabel}>Incoming Call...</Text>
            <Text style={styles.ringingCallerName}>{callerName}</Text>
            <Text style={styles.ringingCallerPhone}>Mobile +91 98765 43210</Text>
          </View>

          <View style={styles.ringingActions}>
            <TouchableOpacity style={styles.declineBtn} onPress={handleDecline}>
              <Text style={styles.actionIcon}>❌</Text>
              <Text style={styles.actionBtnLabel}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.acceptBtn} onPress={handleAnswer}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionBtnLabel}>Accept</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Simulated Active Call Screen */}
      <Modal visible={inCall} transparent animationType="fade">
        <SafeAreaView style={styles.activeCallScreen}>
          <View style={styles.ringingTop}>
            <Text style={styles.ringingCallerName}>{callerName}</Text>
            <Text style={styles.callDurationText}>{formatCallTime(callDuration)}</Text>
            <Text style={styles.audioActiveText}>🔊 Automated Voice Simulation Active</Text>
          </View>

          <TouchableOpacity style={styles.endCallBtn} onPress={handleDecline}>
            <Text style={styles.endCallIcon}>🔴</Text>
            <Text style={styles.endCallLabel}>End Call</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerDesc: {
    fontSize: 13,
    color: '#8E8E9E',
    marginTop: 6,
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#1E1E2C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#0F0F1A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  chipActive: {
    backgroundColor: 'rgba(255, 74, 107, 0.2)',
    borderColor: '#FF4A6B',
  },
  chipText: {
    color: '#8E8E9E',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FF4A6B',
  },
  scheduleBtn: {
    backgroundColor: '#FF4A6B',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF4A6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  scheduleBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  countdownBox: {
    backgroundColor: '#1E1E2C',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  countdownText: {
    color: '#00E676',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cancelCountBtn: {
    paddingVertical: 6,
  },
  cancelCountText: {
    color: '#FF1744',
    fontSize: 13,
    fontWeight: 'bold',
  },
  ringingScreen: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    padding: 30,
  },
  ringingTop: {
    alignItems: 'center',
    marginTop: 80,
  },
  incomingLabel: {
    color: '#8E8E9E',
    fontSize: 16,
    marginBottom: 10,
  },
  ringingCallerName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  ringingCallerPhone: {
    color: '#8E8E9E',
    fontSize: 15,
    marginTop: 6,
  },
  ringingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 60,
  },
  declineBtn: {
    backgroundColor: '#FF1744',
    width: 75,
    height: 75,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#00E676',
    width: 75,
    height: 75,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 26,
  },
  actionBtnLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
  },
  activeCallScreen: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    justifyContent: 'space-between',
    padding: 30,
  },
  callDurationText: {
    color: '#00E676',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  audioActiveText: {
    color: '#8E8E9E',
    fontSize: 12,
    marginTop: 12,
  },
  endCallBtn: {
    backgroundColor: '#FF1744',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 40,
  },
  endCallIcon: {
    fontSize: 20,
  },
  endCallLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
