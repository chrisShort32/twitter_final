import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import PostInput from '../components/PostInput';
import FollowingFeed from '../components/FollowingFeed';
import MyPostsFeed from '../components/myPostsFeed';
import SearchBar from '../components/SearchBar';
import { getUserProfile } from '../api/authApi';

const HomeScreen = ({ navigation }) => {
  const { user, logout} = useAuth();
  const [activeTab, setActiveTab] = useState('following');
  const [refreshTrigger, setRefreshTrigger] = useState(0);  
 
  const handlePostSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  };

  const handleLikeSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    };

  const handleReYeetSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  };
  const handleLogout = async () => {
    await logout();
    // Navigation is handled by the AuthContext
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Edit Profile</Text>
        </TouchableOpacity>
        <Image source={require('../../assets/y_logo.png')} style={styles.logo} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 15, marginBottom: 10 }}>
        <SearchBar navigation={navigation} />
      </View>

      {/* Test Button for User Profile */}
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <TouchableOpacity 
          style={{
            backgroundColor: '#1DA1F2',
            paddingVertical: 8,
            paddingHorizontal: 15,
            borderRadius: 20,
            marginBottom: 10
          }}
          onPress={() => {
            console.log('Test navigation to user profile');
            navigation.navigate('UserProfile', { username: 'shenderson88' });
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
            Test Profile Navigation
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{
            backgroundColor: '#1DA1F2',
            paddingVertical: 8,
            paddingHorizontal: 15,
            borderRadius: 20,
            marginBottom: 10
          }}
          onPress={() => {
            console.log('Navigating to Lucas profile');
            navigation.navigate('UserProfile', { username: 'lucasb87' });
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
            View Lucas Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Post Input */}
      <View style={{ paddingHorizontal: 15, marginBottom: 10 }}>
        <PostInput user={user} onPostSuccess={handlePostSuccess} />
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'following' && styles.tabButtonActive]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={activeTab === 'following' ? styles.tabTextActive : styles.tabText}>Following</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'myposts' && styles.tabButtonActive]}
          onPress={() => setActiveTab('myposts')}
        >
          <Text style={activeTab === 'myposts' ? styles.tabTextActive : styles.tabText}>My Posts</Text>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <View style={{ flex: 1,  width: '100%', maxWidth: 900, alignSelf: 'center' }}>
        {activeTab === 'following' ? (
          <FollowingFeed
            refreshTrigger={refreshTrigger}
            onLikeSuccess={handleLikeSuccess}
            onReYeetSuccess={handleReYeetSuccess}
          />
         ) : (
         <MyPostsFeed
            refreshTrigger={refreshTrigger}
            onLikeSuccess={handleLikeSuccess}
            onReYeetSuccess={handleReYeetSuccess}
          />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  logoutButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#1DA1F2',
    borderRadius: 15,
    width: 90,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderColor: 'transparent',
    marginHorizontal: 10,
  },
  tabButtonActive: {
    borderColor: '#1DA1F2',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#1DA1F2',
    fontWeight: 'bold',
    fontSize: 14,
  },
});


export default HomeScreen; 