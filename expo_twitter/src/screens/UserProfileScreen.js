import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { getUserProfile, toggleFollow } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import Yeet from '../components/Yeet';

const UserProfileScreen = ({ route, navigation }) => {
  const { username } = route.params;
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getUserProfile(username);
      
      if (response.success) {
        setProfile(response.profile);
        setIsFollowing(response.profile.is_following);
        setFollowersCount(response.profile.followers_count);
        setFollowingCount(response.profile.following_count);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('An error occurred while fetching the profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const response = await toggleFollow(username);
      
      if (response.success) {
        setIsFollowing(response.followed);
        if (response.followed) {
          setFollowersCount(followersCount + 1);
        } else {
          setFollowersCount(followersCount - 1);
        }
      } else {
        console.error('Failed to toggle follow:', response.error);
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: profile.profile_image || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile.first_name} {profile.last_name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio || 'No bio available'}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{profile.posts_count || 0}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {user.username !== profile.username && (
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={handleFollowToggle}
            >
              <Text style={styles.followButtonText}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'posts' && styles.activeTabButton]}
            onPress={() => handleTabPress('posts')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'posts' && styles.activeTabButtonText]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'likes' && styles.activeTabButton]}
            onPress={() => handleTabPress('likes')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'likes' && styles.activeTabButtonText]}>
              Likes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'retweets' && styles.activeTabButton]}
            onPress={() => handleTabPress('retweets')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'retweets' && styles.activeTabButtonText]}>
              Retweets
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {activeTab === 'posts' && profile.posts && profile.posts.length > 0 ? (
            profile.posts.map(post => (
              <Yeet
                key={post.post_id}
                post={post}
                onLikeSuccess={() => {}}
                onReYeetSuccess={() => {}}
              />
            ))
          ) : activeTab === 'likes' && profile.liked_posts && profile.liked_posts.length > 0 ? (
            profile.liked_posts.map(post => (
              <Yeet
                key={post.post_id}
                post={post}
                onLikeSuccess={() => {}}
                onReYeetSuccess={() => {}}
              />
            ))
          ) : activeTab === 'retweets' && profile.retweeted_posts && profile.retweeted_posts.length > 0 ? (
            profile.retweeted_posts.map(post => (
              <Yeet
                key={post.post_id}
                post={post}
                onLikeSuccess={() => {}}
                onReYeetSuccess={() => {}}
              />
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                {activeTab === 'posts'
                  ? 'No posts yet'
                  : activeTab === 'likes'
                  ? 'No liked posts'
                  : 'No retweets'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#1DA1F2',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF0000',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#1DA1F2',
    borderRadius: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
    color: '#657786',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: '#14171A',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#657786',
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#1DA1F2',
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1DA1F2',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#1DA1F2',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#657786',
  },
  activeTabButtonText: {
    color: '#1DA1F2',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  emptyStateContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#657786',
  },
});

export default UserProfileScreen; 