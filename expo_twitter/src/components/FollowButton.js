import React, {useState, useEffect} from 'react';
import { View, Text,Platform, Image, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios'

const FollowButton = ({ 
  user, 
  targetUsername,
  isFollowing, 
  setIsFollowing, 
  followersCount, 
  setFollowersCount, 
  onToggle
  }) => {
  
    if (!user || !user.username || !targetUsername) {
    console.log('[FollowButton] Waiting for user or targetUsername...');
    return null;
  }

  const API_BASE_URL =
     Platform.OS === 'web'
     ? '/api'
     : 'https://group3twitter.hopto.org/api';

  const handleFollow = async () => {
    const newState = !isFollowing;
    setIsFollowing(newState);
    setFollowersCount(followersCount + (newState ? 1 : -1));
    try {
      
      const result = await axios.post(`${API_BASE_URL}/follow_toggle/`, {
        username: targetUsername
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const {status} = result.data;
      const state = status === 'followed';
      setIsFollowing(state);
      setFollowersCount(
        followersCount + (state ? 1 : -1)
      );
    } catch (error) {
      console.error('Follow toggle failed', error);
      setIsFollowing(!newState);
      setFollowersCount(
        followersCount + (state ? 1 : -1)
      );
    }
  };
  return (
    <View style={styles.card}>
      {targetUsername !== user.username && (
        <TouchableOpacity
          onPress={onToggle}
          style={[styles.button, isFollowing ? styles.unfollow : styles.follow]}
          >
            <Text style={styles.buttonText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: 10,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  follow: {
    backgroundColor: '#1DA1F2',
    borderColor: '#1DA1F2',
  },
  unfollow: {
    backgroundColor: '#1DA1F2',
    borderColor: '#1DA1F2',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FollowButton;
