import React, {useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert, Switch, Platform } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location'
import { useAuth } from '../context/AuthContext';

const PostInput = ({onPostSuccess}) => {
  const {user} = useAuth();
  const [postText, setPostText] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  
  const handlePost = async () => {
    if (!postText.trim()) return;
  
    let latitude = null;
    let longitude = null;
    let location_name = null;
  
    try {
      if (useLocation) {
  
        if (Platform.OS === 'web') {
          const getWebLocation =  () => {
            return new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });
          };
        
          try {
            const position = await getWebLocation();
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
        
            const geoResponse = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
              params: {
                lat: latitude,
                lon: longitude,
                format: 'json',
              },
              headers: {
                'Accept-Language': 'en', // optional, ensures city/state in English
              }
            });
        
            const { address } = geoResponse.data;
            location_name = [address.city || address.town || address.village, address.state]
              .filter(Boolean)
              .join(', ');
        
            console.log('Nominatim location_name:', location_name);
        
          } catch (err) {
            console.warn('Nominatim reverse geocode failed:', err);
            location_name = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
          }
        
        
        } else {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Location permission denied');
            return;
          }
          const loc = await Location.getCurrentPositionAsync({});
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;
  
          const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
          location_name = [geo[0]?.city, geo[0]?.region].filter(Boolean).join(', ');
        }
      }
   
     const API_BASE_URL =
        Platform.OS === 'web'
        ? '/api'
        : 'https://group3twitter.hopto.org/api';
      await axios.post(`${API_BASE_URL}/post_yeet/`, {
          username: user.username,
          post_content: postText,
          latitude,
          longitude,
          location_name
        });
          
      setPostText('');
      setUseLocation(false);
      if (onPostSuccess) onPostSuccess();
    } catch (error) {
      console.error('Error posting Yeet:', error);
    }
        
  };

  
  return (
    <View style={styles.card}>
      <Image
        source={user?.picture ? { uri: user?.picture } : require('../../assets/y_logo.png')}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
      <TextInput
        style={styles.input}
        placeholder="What's happening?"
        placeholderTextColor="#999"
        value={postText}
        onChangeText={setPostText}
        multiline
      />
      <View style={styles.actionRow}>
      <View style={styles.toggleRow}>
        <Text style={styles.locationLabel}>📍 Use Location  </Text>
        <Switch
          value={useLocation}
          onValueChange={setUseLocation}
        />
      </View>
      <TouchableOpacity onPress={handlePost} style={styles.button}>
        <Text style={styles.buttonText}>Yeet</Text>
      </TouchableOpacity>
    </View>
    </View>
    </View>
  );
};
const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      width: '100%',
      maxWidth: 750,
      backgroundColor: '#f5f8fa',
      borderRadius: 12,
      padding: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
      marginBottom: 20,
      alignSelf: 'center',
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginBottom: 10,
      marginRight: 10,
      backgroundColor: '#e1e8ed',
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccd6dd',
        marginRight: 10,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
    },
    locationLabel: {
      fontSize: 14,
      color: '#333',
    },
    button: {
        backgroundColor: '#1da1f2',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginRight: 10,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    handle: {
        fontSize: 14,
        color: '#657786',
        marginBottom: 10,
      },
  });
export default PostInput;
