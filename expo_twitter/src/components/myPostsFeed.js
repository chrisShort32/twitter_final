import React, {useEffect, useState} from 'react';
import {Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Yeet from './Yeet';

const MyPostsFeed = ({refreshTrigger, onLikeSuccess, onReYeetSuccess}) => {
    const { user } = useAuth();
    const [myPosts, setMyPosts] = useState([]);

    useEffect(() => {
        if (!user?.username) return;

        const fetchMyPosts = async () => {
            try {
                const result = await axios.get(`http://54.147.244.63:8000/api/user_posts/${user.username}`)
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
                    item={item} 
                    onLikeSuccess={onLikeSuccess} 
                    onReYeetSuccess={onReYeetSuccess}
                />
            )}
        />
            
)};

export default MyPostsFeed;