import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { searchUsers } from '../api/authApi';

const SearchBar = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setSearching(true);
    
    try {
      console.log("Searching for:", query);
      const response = await searchUsers(query);
      
      if (response.success) {
        console.log("Search results:", response.users);
        setResults(response.users);
      } else {
        console.error("Search error:", response.error);
        setError(response.error);
        setResults([]);
      }
    } catch (err) {
      console.error("Search exception:", err);
      setError('An error occurred while searching');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileNavigation = (username) => {
    console.log('Handling profile navigation for:', username);
    
    // First hide the search results UI immediately
    setSearching(false);
    setQuery('');
    setResults([]);
    
    // Give time for the UI to update before navigating
    setTimeout(() => {
      console.log('Executing profile navigation for:', username);
      
      try {
        // Force reset navigation stack to ensure reliable navigation
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Home' },
            { 
              name: 'UserProfile', 
              params: { 
                username: username,
                timestamp: new Date().getTime() 
              }
            },
          ],
        });
      } catch (err) {
        console.error('Navigation reset error:', err);
        // Fallback to navigate method
        navigation.navigate('UserProfile', { 
          username: username,
          timestamp: new Date().getTime()
        });
      }
    }, 100);
  };

  const handleUserPress = (username) => {
    console.log('Navigating to profile for:', username);
    
    // Try both navigation methods to ensure one works
    try {
      // First clean up search state before navigating
      setSearching(false);
      setQuery('');
      setResults([]);
      
      // Method 1: Standard navigation with delay to ensure UI updates first
      setTimeout(() => {
        console.log('Executing navigation to UserProfile for:', username);
        navigation.navigate('UserProfile', { username });
      }, 100);
      
      // If first method fails, we'll try this approach
      if (!navigation.canGoBack) {
        navigation.reset({
          index: 1,
          routes: [
            { name: 'Home' },
            { name: 'UserProfile', params: { username } },
          ],
        });
      }
    } catch (err) {
      console.error('Navigation error:', err);
      // Last resort fallback - force navigation
      navigation.reset({
        index: 0,
        routes: [
          { name: 'Home' },
          { name: 'UserProfile', params: { username } },
        ],
      });
    }
  };

  const handleCancel = () => {
    setSearching(false);
    setQuery('');
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search users..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleCancel}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1DA1F2" />
        </View>
      )}

      {error !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {searching && results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id ? item.id.toString() : item.username}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => {
                  console.log('Result item pressed for:', item.username);
                  // This will only trigger if the View Profile button wasn't clicked
                  if (!item._viewProfileButtonPressed) {
                    handleProfileNavigation(item.username);
                  }
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: item.profile_image || 'https://via.placeholder.com/40' }}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.username}>@{item.username}</Text>
                  <Text style={styles.name}>
                    {item.first_name || ''} {item.last_name || ''}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.viewProfileButton}
                  onPress={(event) => {
                    // Prevent event bubbling
                    event.stopPropagation();
                    console.log('View Profile button pressed for:', item.username);
                    // Set a flag to prevent double navigation
                    item._viewProfileButtonPressed = true;
                    handleProfileNavigation(item.username);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.viewProfileText}>View Profile</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {searching && results.length === 0 && !loading && !error && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No users found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#F5F8FA',
  },
  clearButton: {
    position: 'absolute',
    right: 100,
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#657786',
  },
  searchButton: {
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#1DA1F2',
    borderRadius: 20,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#FFDDDD',
    borderRadius: 5,
    marginTop: 5,
  },
  errorText: {
    color: '#FF0000',
  },
  resultsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 5,
    maxHeight: 300,
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 10,
  },
  username: {
    fontWeight: 'bold',
    color: '#1DA1F2',
  },
  name: {
    color: '#657786',
  },
  noResultsContainer: {
    padding: 10,
    alignItems: 'center',
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 5,
    zIndex: 1000,
  },
  noResultsText: {
    color: '#657786',
  },
  viewProfileButton: {
    marginLeft: 'auto',
    backgroundColor: '#1DA1F2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    zIndex: 10000,
  },
  viewProfileText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SearchBar; 