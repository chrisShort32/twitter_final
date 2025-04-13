import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Yeet = ({ item, onLikeSuccess, onReYeetSuccess }) => {
  const {user} = useAuth();

  const handleReYeet = async () => {
    try {
      await axios.post('http://54.147.244.63:8000/api/reyeet_unreyeet/', {
        username: user.username,
        post_id: item.post_id,
      });
      if(onReYeetSuccess) onReYeetSuccess();
    } catch (error) {
      console.error('Error reYeeting:', error);
    }
  };
  
  const handleLike = async () => {
      try {
        await axios.post('http://54.147.244.63:8000/api/like_unlike/', {
          username: user.username,
          post_id: item.post_id,
        });
        if(onLikeSuccess) onLikeSuccess();
      } catch (error) {
        console.error('Error Liking Yeet:', error);
      }

  };
  console.log('yeet item:', item);
  console.log('location_name:', item.location_name, typeof item.location_name);
  return (
    <View style={styles.post}>
      <Text style={styles.username}>@{item.username}</Text>
      <Text style={styles.content}>{item.post_content}</Text>
      <Text style={styles.content}>{new Date(item.post_timestamp).toLocaleString()}</Text>
      
      {typeof item.location_name === 'string' && item.location_name.trim() !== '' && (
        <Text style={styles.content}>{item.location_name}</Text>
      )}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Image
            source={
              item.liked_by_user
                ? require('../../assets/like-filled.png')
                : require('../../assets/like.png')
            }
            style={styles.icon}
          />
          <Text style={styles.actionText}>{item.like_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleReYeet}>
          <Image
            source={
              item.retweeted_by_user
                ? require('../../assets/retweet-filled.png')
                : require('../../assets/retweet.png')
            }
            style={styles.icon}
            
          />
          <Text style={styles.actionText}>{item.retweet_count}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  post: {
    flex: 1,
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  username: {
    fontWeight: 'bold',
    color: '#1DA1F2',
  },
  content: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 5,
    color: '#555',
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});

export default Yeet;
