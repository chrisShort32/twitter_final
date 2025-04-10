import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const UserProfileCard = ({ user, onEditProfile }) => {
  return (
    <View style={styles.card}>
      <Image
        source={user?.picture ? { uri: user.picture } : require('../../assets/y_logo.png')}
        style={styles.avatar}
      />
      <Text style={styles.name}>{user?.first_name || 'Username'}</Text>
      <Text style={styles.handle}>@{user?.username || 'handle'}</Text>
      <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'left',
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#f5f8fa',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: '#e1e8ed',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171A',
  },
  handle: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 10,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1DA1F2',
    borderRadius: 20,
    width: 100,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default UserProfileCard;
