import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'

const FollowingFeed = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (!user?.username) return;

        const fetchFollowingPosts = async () => {
            try {
                const result = await axios.get(`http://54.147.244.63:8000/api/follow_feed/${user.username}/`)
                
                const allPosts = result.data.flatMap(followedUser => 
                    followedUser.posts.map(post => ({
                        ...post,
                        username: followedUser.username,
                    }))
                );
                console.log("Flattened posts:", allPosts);
                setPosts(allPosts);
            } catch (error) {
                console.error(error);
            }
        };

        fetchFollowingPosts();
    }, [user]);

    if (!user?.username) {
        return <Text>Loading feed...</Text>;
    }

    return (
        <FlatList
            data={posts}
            keyExtractor={item => item.post_id.toString()}
            renderItem={({ item }) => (
                <View style={styles.post}>
                    <Text style={styles.username}>@{item.username}</Text>
                    <Text style={styles.content}>{item.content}</Text>
                    <Text style={styles.content}>{new Date(item.created_at).toLocaleString()}</Text>
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    post: {
        padding: 10,
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
});

export default FollowingFeed;