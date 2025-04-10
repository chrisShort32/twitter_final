import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';


const AvatarCard = ({ avatarUrl, username, name }) => {
  return (
    <View style={styles.container}>
      <Image
        source={avatarUrl ? { uri: avatarUrl } : require('../../assets/default-avatar.png')}
        style={styles.avatar}
      />
      <Text style={styles.username}>@{username}</Text>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#B10DC9', // purple background from your design
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