import React, { useEffect, useState } from 'react';
import { Text, FlatList } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Yeet from './Yeet';

const FollowingFeed = ({ refreshTrigger, onLikeSuccess, onReYeetSuccess }) => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (!user?.username) return;

        const fetchFollowingPosts = async () => {
            try {
                const result = await axios.get(`http://54.147.244.63:8000/api/follow_feed/${user.username}/`)
                
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