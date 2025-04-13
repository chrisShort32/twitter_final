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
  Alert,
} from 'react-native';
import { getUserProfile, toggleFollow } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import Yeet from '../components/Yeet';

const UserProfileScreen = ({ route, navigation }) => {
  const username = route?.params?.username;
  const timestamp = route?.params?.timestamp;
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    console.log('[UserProfileScreen] Mounted with username:', username, 'timestamp:', timestamp);
    
    if (!username) {
      console.error('[UserProfileScreen] No username provided');
      setError('No username provided. Please try again.');
      setLoading(false);
      return;
    }
    
    // Reset profile state for new username
    setProfile(null);
    setLoading(true);
    setError('');
    
    // Fetch user profile data
    fetchUserProfile();
    
    // Return cleanup function
    return () => {
      console.log('[UserProfileScreen] Unmounting for username:', username);
    };
  }, [username, timestamp]);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('[UserProfileScreen] Fetching profile for:', username);
      
      // Create mock profile data if needed for testing
      const mockProfile = {
        username: username,
        first_name: 'Test',
        last_name: 'User',
        bio: 'This is a mock profile for testing',
        followers_count: 5,
        following_count: 10,
        posts_count: 3,
        posts: [
          {
            post_id: 1,
            user_id: 1,
            username: username,
            content: 'This is a test post',
            created_at: new Date().toISOString(),
            like_count: 2,
            retweet_count: 1
          }
        ]
      };
      
      // Add timeout protection in case API never responds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
      );
      
      // Race the actual API call with the timeout
      const response = await Promise.race([
        getUserProfile(username),
        timeoutPromise
      ]);
      
      console.log('[UserProfileScreen] Response received:', JSON.stringify(response));
      
      if (response.success && response.profile) {
        console.log('[UserProfileScreen] Profile data received:', response.profile);
        setProfile(response.profile);
        
        // Make sure these property names match what your backend returns
        setIsFollowing(response.profile.is_following || false);
        setFollowersCount(response.profile.followers_count || 0);
        setFollowingCount(response.profile.following_count || 0);
      } else {
        console.error('[UserProfileScreen] Profile fetch error:', response.error);
        setError(`Could not load profile: ${response.error || 'Unknown error'}`);
        
        // Alert the user about the problem
        Alert.alert(
          'Profile Error',
          `Could not load profile for ${username}: ${response.error || 'Unknown error'}`,
          [{ text: 'OK' }]
        );
        
        // For testing, use mock data instead of showing error
        console.log('[UserProfileScreen] Using mock profile data');
        setProfile(mockProfile);
        setFollowersCount(mockProfile.followers_count);
        setFollowingCount(mockProfile.following_count);
      }
    } catch (err) {
      console.error("[UserProfileScreen] Profile fetch error:", err);
      setError(`An error occurred while fetching the profile: ${err.message}`);
      
      // Alert the user about the problem
      Alert.alert(
        'Profile Error',
        `Could not load profile for ${username}: ${err.message}`,
        [{ text: 'OK' }]
      );
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
    const debugInfo = `Loading profile for username: ${username || 'undefined'}`;
    console.log(debugInfo);
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text style={styles.debugText}>{debugInfo}</Text>
      </View>
    );
  }

  if (error) {
    const debugInfo = `Error loading profile for username: ${username || 'undefined'}, Error: ${error}`;
    console.log(debugInfo);
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.debugText}>{debugInfo}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    const debugInfo = `Profile not found for username: ${username || 'undefined'}`;
    console.log(debugInfo);
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
        <Text style={styles.debugText}>{debugInfo}</Text>
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

      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.nameText}>{profile.first_name} {profile.last_name}</Text>
          <Text style={styles.usernameText}>@{profile.username}</Text>
        </View>
        <View style={styles.bioContainer}>
          <Text style={styles.bioText}>{profile.bio || 'No bio available'}</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{profile.followers_count || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{profile.following_count || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Tab Selection */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'posts' && styles.activeTabButton]}
            onPress={() => handleTabPress('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'likes' && styles.activeTabButton]}
            onPress={() => handleTabPress('likes')}
          >
            <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>
              Likes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'retweets' && styles.activeTabButton]}
            onPress={() => handleTabPress('retweets')}
          >
            <Text style={[styles.tabText, activeTab === 'retweets' && styles.activeTabText]}>
              Retweets
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on selected tab */}
        <View style={styles.contentContainer}>
          {activeTab === 'posts' && (
            <>
              {profile.posts && profile.posts.length > 0 ? (
                <>
                  {profile.posts.map((post, index) => (
                    <View key={index} style={styles.postItem}>
                      <Text style={styles.postText}>{post.content || post.post_content}</Text>
                      <Text style={styles.postTime}>{post.created_at || post.post_timestamp}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>No posts yet</Text>
                </View>
              )}
            </>
          )}

          {activeTab === 'likes' && (
            <>
              {profile.liked_posts && profile.liked_posts.length > 0 ? (
                <>
                  {profile.liked_posts.map((post, index) => (
                    <View key={index} style={styles.postItem}>
                      <Text style={styles.postUsername}>@{post.username}</Text>
                      <Text style={styles.postText}>{post.content || post.post_content}</Text>
                      <Text style={styles.postTime}>{post.created_at || post.post_timestamp}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>No liked posts</Text>
                </View>
              )}
            </>
          )}

          {activeTab === 'retweets' && (
            <>
              {profile.retweeted_posts && profile.retweeted_posts.length > 0 ? (
                <>
                  {profile.retweeted_posts.map((post, index) => (
                    <View key={index} style={styles.postItem}>
                      <Text style={styles.postUsername}>@{post.username}</Text>
                      <Text style={styles.postText}>{post.content || post.post_content}</Text>
                      <Text style={styles.postTime}>{post.created_at || post.post_timestamp}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>No retweets</Text>
                </View>
              )}
            </>
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
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#FF0000',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
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
  headerContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
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
  bioContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  bioText: {
    fontSize: 16,
    color: '#14171A',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  statItem: {
    marginRight: 20,
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171A',
  },
  statLabel: {
    fontSize: 14,
    color: '#657786',
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
  tabText: {
    fontSize: 14,
    color: '#657786',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1DA1F2',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  emptyStateContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
  },
  postItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    marginBottom: 5,
  },
  postUsername: {
    fontSize: 14,
    color: '#1DA1F2',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postText: {
    fontSize: 16,
    color: '#14171A',
    lineHeight: 22,
    marginBottom: 5,
  },
  postTime: {
    fontSize: 14,
    color: '#657786',
    marginTop: 5,
  },
  debugText: {
    color: '#657786',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
    padding: 5,
    backgroundColor: '#F5F8FA',
    borderRadius: 5,
  },
});

export default UserProfileScreen; 