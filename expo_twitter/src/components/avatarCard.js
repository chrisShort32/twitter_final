import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';


const AvatarCard = ({ user }) => {
  const base_pic_url = 'http://54.147.244.63:8000/media/'
  return (
    <View style={styles.container}>
      <Image
        source={user?.picture ? { uri: base_pic_url + user?.picture } : require('../../assets/y_logo.png')}
        style={styles.avatar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#B10DC9',
    borderRadius: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default AvatarCard;