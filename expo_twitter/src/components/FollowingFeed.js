import React, { useEffect, useState } from 'react';
import { Text, FlatList, Platform } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Yeet from './Yeet';

const FollowingFeed = ({ refreshTrigger, onLikeSuccess, onReYeetSuccess }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const API_BASE_URL =
      Platform.OS === 'web'
      ? '/api'
      : 'https://group3twitter.hopto.org/api';
   
    useEffect(() => {
        if (!user?.username) return;

        const fetchFollowingPosts = async () => {
            try {
                const result = await axios.get(`${API_BASE_URL}/follow_feed/${user.username}/`)
                
                setPosts(result.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchFollowingPosts();
    }, [user, refreshTrigger]);

    if (!user?.username) {
        return <Text>Loading feed...</Text>;
    }

    return (
        <FlatList 
            data={posts} 
            keyExtractor={item => item.post_id.toString()}
            renderItem={({ item }) => (
            <Yeet
                post={{...item}}
                onLikeSuccess={onLikeSuccess}
                onReYeetSuccess={onReYeetSuccess}
            />
        )}
            
        contentContainerStyle={{ paddingBottom: 120 }}
        />
            
)};                

export default FollowingFeed;
