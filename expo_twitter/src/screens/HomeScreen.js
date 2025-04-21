import React, { useState, useCallback, useEffect} from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieConsentModal from '../components/Consent';
import { addScreenView, startScreenTimer, stopScreenTimer, incrementButtonStat, addRecentSearch, setLocationToggle} from '../utils/Tracking';




const HomeScreen = ({ navigation }) => {
  const { user, logout} = useAuth();
  const [activeTab, setActiveTab] = useState('following');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showConsentModal, setShowConsentModal] = useState(false); 
  const [hasCheckedConsent, setHasCheckedConsent] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
  
      const checkConsent = async () => {
        if (hasCheckedConsent) return;
  
        const consentKey = `userConsent-${user.username}`;
        const consent = await AsyncStorage.getItem(consentKey);
        if (!consent && isActive) {
          setShowConsentModal(true);
        }
  
        if (isActive) {
          setHasCheckedConsent(true);
        }
      };
  
      checkConsent();
  
      return () => {
        isActive = false;
      };
    }, [user.username, hasCheckedConsent])
  );
  
  
  useFocusEffect(
    useCallback(() => {
      addScreenView('HomeScreen');
      startScreenTimer();
  
      return () => stopScreenTimer('HomeScreen');
    }, [])
  );
  
  useFocusEffect(
    useCallback(() => {
      setRefreshTrigger(prev => prev + 1);
    }, [])
  );
  
  const handleConsentAccept = async () => {
    const consentKey = `userConsent-${user.username}`;
    console.log('🍪 Saving consent for:', consentKey);
    await AsyncStorage.setItem(consentKey, JSON.stringify({accepted: true, timestamp: Date.now()}));
    setShowConsentModal(false);
  }

  const handleConsentDecline = async () => {
    const consentKey = `userConsent-${user.username}`;
    await AsyncStorage.setItem(consentKey, JSON.stringify({accepted: false, timestamp: Date.now()}));
    setShowConsentModal(false);
  };


  const handlePostSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    incrementButtonStat('postCreated');
  };

  const handleLikeSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    incrementButtonStat('likePressed');
    };

  const handleReYeetSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    incrementButtonStat('reyeetPressed');
  };
  const handleLogout = async () => {
    await logout();
    // Navigation is handled by the AuthContext
  };

  const handleFeedbackSurvey = () => {
    navigation.navigate('FeedbackSurvey');
    incrementButtonStat('feedbackOpened');
  };

  
  

  return (
    <SafeAreaView style={styles.container}>
      <CookieConsentModal
        visible={showConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />
      
      <ScrollView>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => {
            console.log('Navigating to my profile');
            navigation.push('UserProfile', { 
              username: user.username,
              timestamp: new Date().getTime(),
            });
          }}
        >
          <Text style={styles.buttonText}>My Profile</Text>
        </TouchableOpacity>
        <Image source={require('../../assets/y_logo.png')} style={styles.logo} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Survey Button */}
      <TouchableOpacity 
        style={styles.feedbackButton} 
        onPress={handleFeedbackSurvey}
      >
        <Text style={styles.feedbackButtonText}>Give Feedback</Text>
      </TouchableOpacity>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar navigation={navigation} />
      </View>

      {/* Post Input */}
      <View style={{ zIndex:0, paddingHorizontal: 15, marginBottom: 10 }}>
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
  profileButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#1DA1F2',
    borderRadius: 15,
    width: 90,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 15, 
    marginBottom: 50,
    zIndex: 1,
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
  feedbackButton: {
    backgroundColor: '#1DA1F2',
    marginHorizontal: 15,
    marginBottom: 15,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});


export default HomeScreen; 