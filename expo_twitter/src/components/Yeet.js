import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import MapModal from './MadModal';

const Yeet = ({ post, onLikeSuccess, onReYeetSuccess }) => {
  const { user } = useAuth();

  // Local state 
  const [isLiked, setIsLiked] = useState(post.liked_by_user || false);
  const [isRetweeted, setIsRetweeted] = useState(post.retweeted_by_user || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [retweetCount, setRetweetCount] = useState(post.retweet_count || 0);

  const [mapVisible, setMapVisible] = useState(false);

  const showMap = () => setMapVisible(true);
  const hideMap = () => setMapVisible(false);

  const handleLike = async () => {
    try {
      await axios.post('http://54.147.244.63:8000/api/like_unlike/', {
        username: user.username,
        post_id: post.post_id,
      });
      const newLiked = !isLiked;
      setIsLiked(newLiked);
      setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
      onLikeSuccess && onLikeSuccess(post.post_id);
    } catch (error) {
      console.error('Error Liking Yeet:', error);
    }
  };

  const handleReYeet = async () => {
    try {
      await axios.post('http://54.147.244.63:8000/api/reyeet_unreyeet/', {
        username: user.username,
        post_id: post.post_id,
      });
      const newRetweet = !isRetweeted;
      setIsRetweeted(newRetweet);
      setRetweetCount(prev => newRetweet ? prev + 1 : prev - 1);
      onReYeetSuccess && onReYeetSuccess(post.post_id);
    } catch (error) {
      console.error('Error reYeeting:', error);
    }
  };

  return (
    <View style={styles.post}>
      <Text style={styles.username}>@{post.username}</Text>
      <Text style={styles.content}>{post.post_content}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {new Date(post.post_timestamp).toLocaleString()}
        </Text>
        {typeof post.location_name === 'string' && post.location_name.trim() !== '' && (
        <Text style={styles.metaText}> • {post.location_name} </Text>
        )}
        {post.longitude && post.latitude && (
          <TouchableOpacity onPress={showMap}>
            <Text>📍</Text>
          </TouchableOpacity>
        )}

        <MapModal
          visible={mapVisible}
          onClose={hideMap}
          location={{ latitude: post.latitude, longitude: post.longitude }}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Image
            source={
              isLiked
                ? require('../../assets/like-filled.png')
                : require('../../assets/like.png')
            }
            style={styles.icon}
          />
          <Text style={styles.actionText}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleReYeet}>
          <Image
            source={
              isRetweeted
                ? require('../../assets/retweet-filled.png')
                : require('../../assets/retweet.png')
            }
            style={styles.icon}
          />
          <Text style={styles.actionText}>{retweetCount}</Text>
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
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#657786',
  },
  
});

export default Yeet;
