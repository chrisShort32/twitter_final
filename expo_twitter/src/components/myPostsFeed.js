import React, {useEffect, useSate} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, Image} from 'react-native';
import axios from 'axios';

const MyPostsFeed = () => {
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

    }, [user]);

    if (!user?.username) {
        return <Text>Loading...</Text>;
    }

    return (
        <FlatList
            data={myPosts}
            keyExtractor={item => item.post_id.toString()}
            renderItem={({ item }) => (
                <View style={styles.post}>
                    <Text style={styles.username}>@{item.username}</Text>
                    <Text style={styles.content}>{item.post_content}</Text>
                    <Text style={styles.content}>{new Date(item.post_timestamp).toLocaleString()}</Text>
                    <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Like post', item.post_id)}>
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
                    
                    <TouchableOpacity style={styles.actionButton} onPress={() => console.log('ReYeet post', item.post_id)}>
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
    actions: {
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center'
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
        resizeMode: 'contain'
    },
});

export default MyPostsFeed;