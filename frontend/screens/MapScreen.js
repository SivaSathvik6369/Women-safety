import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { api } from '../services/api';

export default function MapScreen() {
  const [origin, setOrigin] = useState('My Current Location');
  const [destination, setDestination] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('safe');
  const [loading, setLoading] = useState(false);
  const [routeResults, setRouteResults] = useState(null);

  const handleSearchRoutes = async () => {
    if (!destination.trim()) {
      Alert.alert('Destination Required', 'Please enter a destination in India (e.g. Saket, Mumbai, India Gate).');
      return;
    }

    setLoading(true);
    try {
      const data = await api.getSafeRoute(origin, destination);
      setRouteResults(data);
    } catch (e) {
      Alert.alert('Routing Error', 'Unable to fetch safe route.');
    } finally {
      setLoading(false);
    }
  };

  const safeRoute = routeResults?.safest_route || {
    name: 'AI Safe Walkway (Recommended)',
    distance_km: 2.4,
    eta_minutes: 11,
    danger_score: 1.5,
    parameters: {
      street_lighting: 'Excellent (94% well-lit)',
      cctv_coverage: 'High (82% CCTV active)',
      police_presence: 'Active (Patrol zone 4)',
    },
  };

  const altRoute = routeResults?.alternative_routes?.[0] || {
    name: 'Standard Path (Fastest)',
    distance_km: 2.1,
    eta_minutes: 8,
    danger_score: 6.8,
    parameters: {
      street_lighting: 'Poor (32% illuminated)',
      cctv_coverage: 'Low (12% cameras)',
      police_presence: 'Sparse',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>📍</Text>
          <TextInput
            style={styles.textInput}
            placeholder="From: Location"
            placeholderTextColor="#8E8E9E"
            value={origin}
            onChangeText={setOrigin}
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>🎯</Text>
          <TextInput
            style={styles.textInput}
            placeholder="To: Place in India (e.g. Saket, Mumbai)"
            placeholderTextColor="#8E8E9E"
            value={destination}
            onChangeText={setDestination}
          />
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearchRoutes}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.searchBtnText}>🔍 Find Safest Path</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Visual Navigation Banner */}
      <View style={styles.mapBanner}>
        <Text style={styles.mapBannerEmoji}>🗺️</Text>
        <Text style={styles.mapBannerTitle}>Real-time Mapbox Navigation Grid</Text>
        <Text style={styles.mapBannerSub}>
          {origin} ➔ {destination || 'Destination'}
        </Text>
        <View style={styles.cctvIndicator}>
          <Text style={styles.cctvText}>🔵 14 Active CCTV Safety Nodes Mapped</Text>
        </View>
      </View>

      {/* Route Cards */}
      <ScrollView style={styles.routesScroll} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.panelTitle}>Evaluated Walking Paths</Text>

        {/* Safe Route Card */}
        <TouchableOpacity
          style={[styles.routeCard, selectedRoute === 'safe' && styles.selectedSafe]}
          onPress={() => setSelectedRoute('safe')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.routeName}>{safeRoute.name}</Text>
            <Text style={styles.badgeSafe}>9.5/10 Safety</Text>
          </View>
          <Text style={styles.routeDetails}>
            {safeRoute.eta_minutes} mins • {safeRoute.distance_km} km • {safeRoute.parameters.street_lighting}
          </Text>
          <View style={styles.tagList}>
            <Text style={styles.tagGreen}>🟢 {safeRoute.parameters.cctv_coverage}</Text>
            <Text style={styles.tagGreen}>🚓 {safeRoute.parameters.police_presence}</Text>
          </View>
        </TouchableOpacity>

        {/* Alternate Route Card */}
        <TouchableOpacity
          style={[styles.routeCard, selectedRoute === 'fastest' && styles.selectedDanger]}
          onPress={() => setSelectedRoute('fastest')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.routeName}>{altRoute.name}</Text>
            <Text style={styles.badgeDanger}>3.2/10 Safety</Text>
          </View>
          <Text style={styles.routeDetails}>
            {altRoute.eta_minutes} mins • {altRoute.distance_km} km • {altRoute.parameters.street_lighting}
          </Text>
          <View style={styles.tagList}>
            <Text style={styles.tagRed}>⚠️ Low CCTV Coverage ({altRoute.parameters.cctv_coverage})</Text>
            <Text style={styles.tagRed}>⚠️ Isolated Alley Segments Warning</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navigateButton}
          onPress={() => Alert.alert('Navigation Started', `Guidance active on ${selectedRoute === 'safe' ? 'Safe Route' : 'Standard Route'}. Aegis voice guardian enabled.`)}
        >
          <Text style={styles.navigateText}>START SAFE WALK NAVIGATION</Text>
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
  searchBarContainer: {
    padding: 16,
    backgroundColor: '#1E1E2C',
    borderBottomWidth: 1,
    borderBottomColor: '#2F2F45',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F1A',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2F2F45',
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 13,
  },
  searchBtn: {
    backgroundColor: '#FF4A6B',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mapBanner: {
    height: 140,
    backgroundColor: '#161626',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2F2F45',
    position: 'relative',
    paddingHorizontal: 20,
  },
  mapBannerEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  mapBannerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  mapBannerSub: {
    color: '#8E8E9E',
    fontSize: 12,
    marginTop: 2,
  },
  cctvIndicator: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: '#0F0F1A',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: '#4A90E2',
  },
  cctvText: {
    color: '#4A90E2',
    fontSize: 10,
    fontWeight: 'bold',
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  routesScroll: {
    flex: 1,
  },
  routeCard: {
    backgroundColor: '#1E1E2C',
    borderRadius: 14,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  badgeSafe: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    color: '#00E676',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeDanger: {
    backgroundColor: 'rgba(255, 23, 68, 0.15)',
    color: '#FF1744',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  routeDetails: {
    fontSize: 12,
    color: '#8E8E9E',
    lineHeight: 16,
  },
  tagList: {
    marginTop: 8,
  },
  tagGreen: {
    color: '#00E676',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  tagRed: {
    color: '#FF4A6B',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  navigateButton: {
    backgroundColor: '#FF4A6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  navigateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
