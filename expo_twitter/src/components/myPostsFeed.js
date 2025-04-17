import React, {useEffect, useState} from 'react';
import {Text, FlatList, StyleSheet, Platform } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Yeet from './Yeet';

const MyPostsFeed = ({refreshTrigger, onLikeSuccess, onReYeetSuccess}) => {
    const { user } = useAuth();
    const [myPosts, setMyPosts] = useState([]);

   const API_BASE_URL =
      Platform.OS === 'web'
      ? '/api'
      : 'https://group3twitter.hopto.org/api';

    useEffect(() => {
        if (!user?.username) return;

        const fetchMyPosts = async () => {
            try {
                const result = await axios.get(`${API_BASE_URL}/user_posts/${user.username}`)
                setMyPosts(result.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchMyPosts();

    }, [user, refreshTrigger]);

    if (!user?.username) {
        return <Text>Loading...</Text>;
    }

    return (
          <FlatList 
            data={myPosts} 
            keyExtractor={item => item.post_id.toString()}
            renderItem={({ item }) => (
                <Yeet 
                    post={{...item}} 
                    onLikeSuccess={onLikeSuccess} 
                    onReYeetSuccess={onReYeetSuccess}
                />
            )}
        />
            
)};

export default MyPostsFeed;
