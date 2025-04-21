import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SessionStats = ({ visible }) => {
  const [trackingData, setTrackingData] = useState(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      console.log('[SessionStats] Fetching tracking data...');

      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) {
        console.log('[SessionStats] No user in AsyncStorage');
        return;
      }

      const { username } = JSON.parse(userStr);
      console.log('[SessionStats] Logged in as:', username);

      const consentRaw = await AsyncStorage.getItem(`userConsent-${username}`);
      console.log('[SessionStats] Consent raw:', consentRaw);

      const consentAccepted = consentRaw && JSON.parse(consentRaw).accepted;
      if (!consentAccepted) {
        console.log('[SessionStats] Consent not accepted. Skipping display.');
        setTrackingData(null);
        return;
      }

      const [screenViews, buttonStats, timeSpent, recentSearches, locationToggle] = await Promise.all([
        AsyncStorage.getItem(`screenViews-${username}`),
        AsyncStorage.getItem(`buttonStats-${username}`),
        AsyncStorage.getItem(`timeSpent-${username}`),
        AsyncStorage.getItem(`recentSearches-${username}`),
        AsyncStorage.getItem(`locationToggle-${username}`)
      ]);

      console.log('[SessionStats] Retrieved:', {
        screenViews,
        buttonStats,
        timeSpent,
        recentSearches,
        locationToggle
      });

      setTrackingData({
        screenViews: JSON.parse(screenViews) || [],
        buttonStats: JSON.parse(buttonStats) || {},
        timeSpent: JSON.parse(timeSpent) || {},
        recentSearches: JSON.parse(recentSearches) || [],
        locationToggle: JSON.parse(locationToggle) || {},
      });
    };

  fetchTrackingData();
}, []);


  if (!visible ||!trackingData) return null;

  return (
    <View style={styles.trackingCard}>
      <Text style={styles.trackingTitle}>Your Session Stats</Text>

      <Text style={styles.label}>Time Spent:</Text>
      {Object.entries(trackingData.timeSpent).map(([screen, ms]) => (
        <Text key={screen} style={styles.value}>- {screen}: {(ms / 1000).toFixed(1)}s</Text>
      ))}

      <Text style={styles.label}>Button Usage:</Text>
      {Object.entries(trackingData.buttonStats).map(([action, count]) => (
        <Text key={action} style={styles.value}>- {action}: {count}</Text>
      ))}

      <Text style={styles.label}>Recent Searches:</Text>
      <Text style={styles.value}>{trackingData.recentSearches.join(', ')}</Text>

    </View>
  );
};

const styles = StyleSheet.create({
  trackingCard: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1DA1F2',
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1DA1F2',
  },
  label: {
    fontWeight: '600',
    marginTop: 8,
  },
  value: {
    marginLeft: 10,
    color: '#333',
  },
});

export default SessionStats;
