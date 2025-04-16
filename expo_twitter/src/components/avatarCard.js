import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';



const AvatarCard = ({ user }) => {
  console.log('this is the picture:', user.picture);
  return (
    <View style={styles.container}>
      <Image
        source={user?.picture ? { uri: user?.picture } : require('../../assets/y_logo.png')}
        style={styles.avatar}
      />
      <Text style={styles.nameText}>
        {user?.first_name
        ? `${user.first_name} ${user.last_name}` : user?.email}</Text>
      <Text style={styles.usernameText}>@{user.username}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f8fa',
    borderRadius: 12,
    marginBottom: 16,
    maxWidth: 275,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 8,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171A',
  },
  usernameText: {
    fontSize: 16,
    color: '#657786',
    marginTop: 2,
  },
});

export default AvatarCard;