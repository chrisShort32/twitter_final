import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import UserProfileCard from '../components/userProfileCard';

const HomeScreen = () => {
  const { user, logout, isLoading } = useAuth();

  console.log(user);
  const handleLogout = async () => {
    await logout();
    // Navigation is handled by the AuthContext
  };

  // Sample tweets data
  const tweets = [
    {
      id: '1',
      author: 'Y Official',
      handle: '@y',
      content: "Welcome to Y we are much better than X (Twitter)! This is where you'll see the latest Tweets from the people and topics you follow.",
      timestamp: '2h',
      likes: 1205,
      retweets: 342,
      comments: 89
    },
    {
      id: '2',
      author: 'Elon Musk',
      handle: '@elonmusk',
      content: 'Excited to announce that Y is better than X!',
      timestamp: '5h',
      likes: 45600,
      retweets: 8932,
      comments: 2134
    },
    {
      id: '3',
      author: 'NASA',
      handle: '@NASA',
      content: 'Another beautiful day on the International Space Station. Check out this view of Earth from 250 miles above!',
      timestamp: '8h',
      likes: 32000,
      retweets: 5600,
      comments: 1200
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Image
            source={user?.picture ? { uri: user.picture } : require('../../assets/y_logo.png')}
            style={styles.profilePic}
          />
        </TouchableOpacity>
        <Image source={require('../../assets/y_logo.png')} style={styles.logo} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 flex-row">
        <UserProfileCard user={user}></UserProfileCard>
     
      {/* Welcome message */}
        <View className="flex-1" style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome, {user?.name || 'User'}!</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
      </View>
      {/* Tweets feed */}
      <ScrollView style={styles.feed}>
        {tweets.map(tweet => (
          <View key={tweet.id} style={styles.tweetContainer}>
            <View style={styles.tweetHeader}>
              <Text style={styles.tweetAuthor}>{tweet.author}</Text>
              <Text style={styles.tweetHandle}>{tweet.handle}</Text>
              <Text style={styles.tweetTimestamp}>{tweet.timestamp}</Text>
            </View>
            <Text style={styles.tweetContent}>{tweet.content}</Text>
            <View style={styles.tweetActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>💬 {tweet.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>🔄 {tweet.retweets}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>❤️ {tweet.likes}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* New tweet button */}
      <TouchableOpacity style={styles.newTweetButton}>
        <Text style={styles.newTweetButtonText}>+</Text>
      </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  logoutButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#1DA1F2',
    borderRadius: 15,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  welcomeContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171A',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: '#657786',
  },
  feed: {
    flex: 1,
  },
  tweetContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  tweetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  tweetAuthor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#14171A',
    marginRight: 5,
  },
  tweetHandle: {
    fontSize: 13,
    color: '#657786',
    marginRight: 8,
  },
  tweetTimestamp: {
    fontSize: 13,
    color: '#657786',
  },
  tweetContent: {
    fontSize: 15,
    color: '#14171A',
    lineHeight: 22,
    marginBottom: 10,
  },
  tweetActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 40,
  },
  actionButton: {
    padding: 5,
  },
  actionText: {
    fontSize: 13,
    color: '#657786',
  },
  newTweetButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1DA1F2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  newTweetButtonText: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default HomeScreen; 