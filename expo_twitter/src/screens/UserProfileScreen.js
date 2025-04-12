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
  const [debugInfo, setDebugInfo] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    console.log('[UserProfileScreen] Mounted with username:', username, 'timestamp:', timestamp);
    setDebugInfo(`Username param: ${username}, Timestamp: ${timestamp || 'none'}`);
    
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
      setDebugInfo(prev => `${prev}\nFetching data for: ${username}`);
      
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
      setDebugInfo(prev => `${prev}\nAPI Response: ${JSON.stringify(response)}`);
      
      if (response.success && response.profile) {
        console.log('[UserProfileScreen] Profile data received:', response.profile);
        setDebugInfo(prev => `${prev}\nProfile data loaded successfully`);
        setProfile(response.profile);
        
        // Make sure these property names match what your backend returns
        setIsFollowing(response.profile.is_following || false);
        setFollowersCount(response.profile.followers_count || 0);
        setFollowingCount(response.profile.following_count || 0);
      } else {
        console.error('[UserProfileScreen] Profile fetch error:', response.error);
        setDebugInfo(prev => `${prev}\nError: ${response.error || 'Unknown error'}`);
        setError(`Could not load profile: ${response.error || 'Unknown error'}`);
        
        // Alert the user about the problem
        Alert.alert(
          'Profile Error',
          `Could not load profile for ${username}: ${response.error || 'Unknown error'}`,
          [{ text: 'OK' }]
        );
        
        // For testing, use mock data instead of showing error
        console.log('[UserProfileScreen] Using mock profile data');
        setDebugInfo(prev => `${prev}\nUsing mock profile data`);
        setProfile(mockProfile);
        setFollowersCount(mockProfile.followers_count);
        setFollowingCount(mockProfile.following_count);
      }
    } catch (err) {
      console.error("[UserProfileScreen] Profile fetch error:", err);
      setDebugInfo(prev => `${prev}\nException: ${err.message}`);
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text style={styles.debugText}>{debugInfo}</Text>
      </View>
    );
  }

  if (error) {
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

      <ScrollView>
        {debugInfo && <Text style={styles.debugText}>{debugInfo}</Text>}
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
        {profile.posts && profile.posts.length > 0 ? (
          <View style={styles.postsContainer}>
            <Text style={styles.sectionTitle}>Posts</Text>
            {profile.posts.map((post, index) => (
              <View key={index} style={styles.postItem}>
                <Text style={styles.postText}>{post.content}</Text>
                <Text style={styles.postTime}>{post.created_at}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyPostsContainer}>
            <Text style={styles.emptyPostsText}>No posts yet</Text>
          </View>
        )}
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
  postsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#14171A',
  },
  postItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  postText: {
    fontSize: 16,
    color: '#14171A',
    lineHeight: 22,
  },
  postTime: {
    fontSize: 14,
    color: '#657786',
    marginTop: 5,
  },
  emptyPostsContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyPostsText: {
    fontSize: 16,
    color: '#657786',
  },
  debugText: {
    color: 'red',
    padding: 10,
    margin: 5,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    fontSize: 12,
  },
});

export default UserProfileScreen; 