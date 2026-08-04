import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function DashboardScreen({ navigation }) {
  const [safetyScore, setSafetyScore] = useState(85);
  const [zoneLabel, setZoneLabel] = useState("Safe Zone");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Block */}
        <View style={styles.header}>
          <Text style={styles.title}>Aegis Security</Text>
          <Text style={styles.subtitle}>Empowered by AI, IoT & Cloud Computing</Text>
        </View>

        {/* SOS Panic Trigger Button */}
        <TouchableOpacity 
          style={styles.sosButton} 
          onPress={() => navigation.navigate('SOS')}
        >
          <View style={styles.innerSos}>
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSubtext}>One-Touch Emergency Alarm</Text>
          </View>
        </TouchableOpacity>

        {/* Live Safety Status Panel */}
        <View style={styles.safetyCard}>
          <Text style={styles.cardHeader}>Live Location Danger Index</Text>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreNumber, { color: '#00E676' }]}>{safetyScore}%</Text>
            <View style={styles.scoreTextGroup}>
              <Text style={styles.scoreTitle}>{zoneLabel}</Text>
              <Text style={styles.scoreSub}>Street lights active • High CCTV density</Text>
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
            <Text style={styles.cardDesc}>Evaluate lit paths</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridCard} 
            onPress={() => navigation.navigate('Chatbot')}
          >
            <Text style={styles.cardEmoji}>🤖</Text>
            <Text style={styles.cardTitle}>AI Chatbot</Text>
            <Text style={styles.cardDesc}>Emergency advice</Text>
          </TouchableOpacity>
        </View>

        {/* Fake Call Generator Trigger */}
        <TouchableOpacity style={styles.fakeCallButton}>
          <Text style={styles.fakeCallText}>📞 Schedule Fake Escape Call</Text>
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
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E9E',
    marginTop: 4,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF1744',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
    shadowColor: '#FF1744',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  innerSos: {
    alignItems: 'center',
  },
  sosText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  sosSubtext: {
    fontSize: 11,
    color: '#FFE0E6',
    marginTop: 5,
    fontWeight: '500',
  },
  safetyCard: {
    alignSelf: 'stretch',
    backgroundColor: '#1E1E2C',
    borderRadius: 15,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  cardHeader: {
    fontSize: 14,
    color: '#8E8E9E',
    fontWeight: '600',
    marginBottom: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: 15,
  },
  scoreTextGroup: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 18,
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
    marginBottom: 20,
  },
  gridCard: {
    width: '47%',
    backgroundColor: '#1E1E2C',
    borderRadius: 15,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardDesc: {
    fontSize: 11,
    color: '#8E8E9E',
    marginTop: 4,
  },
  fakeCallButton: {
    alignSelf: 'stretch',
    backgroundColor: '#2E2E3F',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#42425A',
  },
  fakeCallText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
