import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import { useAuth } from '../context/AuthContext';
import PostInput from '../components/PostInput';
import FollowingFeed from '../components/FollowingFeed';
import MyPostsFeed from '../components/myPostsFeed';

const HomeScreen = () => {
  const { user, logout, isLoading } = useAuth();
  const screenWidth = Dimensions.get('window').width;
  const isWeb = screenWidth > 600;

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'following', title: 'Following'},
    {key: 'myposts', title: 'My Posts'},
  ]);

  const renderScene = SceneMap ({
    following: () => <FollowingFeed/>,
    myposts: () => <MyPostsFeed user={user}/>,
  });


  
  console.log(user);
  const handleLogout = async () => {
    await logout();
    // Navigation is handled by the AuthContext
  };

  return (
    <SafeAreaView style={styles.container}>
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
      <View>
        <PostInput style={styles.postContainer} user={user}></PostInput>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => (
          <TabBar
          {...props}
          indicatorStyle= {{ backgroundColor: '#1DA1F2' }}
          style={{ backgroundColor: '#fff' }}
          labelStyle= {{ color: '#1DA1F2', fontWeight: 'bold' }}
          />
        )}
      />
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
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  postContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 0.25,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  webLayout: {
    alignItems: 'flex-start',
    paddingHorizontal: 40,
    paddingTop: 15,
  },
  containerInner: {
    width: '100%',
  },
  containerInnerWeb: {
    maxWidth: 250,
  },
});

export default HomeScreen; 