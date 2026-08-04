import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function MapScreen() {
  const [selectedRoute, setSelectedRoute] = useState('safe');

  return (
    <SafeAreaView style={styles.container}>
      {/* Mock Map View Area */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapPlaceholderText}>🗺️ Dynamic Google Maps View</Text>
        <Text style={styles.mapSubText}>[Origin: Current Location -> Destination: Home]</Text>
        <View style={styles.cctvIndicator}>
          <Text style={styles.cctvText}>🔵 12 Active CCTV Nodes Covered</Text>
        </View>
      </View>

      {/* Path Evaluation Panel */}
      <View style={styles.controlPanel}>
        <Text style={styles.panelTitle}>AI Route Optimization Recommendations</Text>
        
        <ScrollView style={styles.routesScroll}>
          {/* Route A Card (AI Recommended Safe Route) */}
          <TouchableOpacity 
            style={[styles.routeCard, selectedRoute === 'safe' && styles.selectedSafe]}
            onPress={() => setSelectedRoute('safe')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.routeName}>AI Safe Walkway (Recommended)</Text>
              <Text style={styles.badgeSafe}>9.5/10 Safety</Text>
            </View>
            <Text style={styles.routeDetails}>11 mins • 2.4 km • 94% Well-lit Roads</Text>
            <Text style={styles.patrolTag}>🚓 Constant Police Patrol Zone</Text>
          </TouchableOpacity>

          {/* Route B Card (Fastest but Dark Route) */}
          <TouchableOpacity 
            style={[styles.routeCard, selectedRoute === 'fastest' && styles.selectedDanger]}
            onPress={() => setSelectedRoute('fastest')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.routeName}>Standard Path (Fastest)</Text>
              <Text style={styles.badgeDanger}>3.2/10 Safety</Text>
            </View>
            <Text style={styles.routeDetails}>8 mins • 2.1 km • 32% Lit • Isolated Area</Text>
            <Text style={styles.patrolTag}>⚠️ High Crime Hotspot Index</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={styles.navigateButton}>
          <Text style={styles.navigateText}>START SAFE NAVIGATION</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  mapContainer: {
    height: '40%',
    backgroundColor: '#1E1E2C',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2F2F45',
    position: 'relative',
  },
  mapPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mapSubText: {
    color: '#8E8E9E',
    fontSize: 12,
    marginTop: 5,
  },
  cctvIndicator: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#0F0F1A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: '#4A90E2',
  },
  cctvText: {
    color: '#4A90E2',
    fontSize: 11,
    fontWeight: 'bold',
  },
  controlPanel: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  routesScroll: {
    flex: 1,
    marginBottom: 15,
  },
  routeCard: {
    backgroundColor: '#1E1E2C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  selectedSafe: {
    borderColor: '#00E676',
    borderWidth: 1.5,
  },
  selectedDanger: {
    borderColor: '#FF1744',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  routeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  badgeSafe: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    color: '#00E676',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeDanger: {
    backgroundColor: 'rgba(255, 23, 68, 0.15)',
    color: '#FF1744',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  routeDetails: {
    fontSize: 13,
    color: '#8E8E9E',
  },
  patrolTag: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 10,
    fontWeight: '600',
  },
  navigateButton: {
    backgroundColor: '#FF4A6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  navigateText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
