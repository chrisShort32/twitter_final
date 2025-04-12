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
    console.log('Navigating to profile for:', username);
    
    // First clean up search state before navigation
    setSearching(false);
    setQuery('');
    setResults([]);
    
    // Wait for UI to update then navigate
    setTimeout(() => {
      navigation.navigate('UserProfile', { 
        username: username,
        timestamp: new Date().getTime() 
      });
    }, 100);
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
          {results.map((item) => (
            <TouchableOpacity 
              key={item.id ? item.id.toString() : item.username} 
              style={styles.resultItem}
              onPress={() => {
                console.log('Profile item clicked for:', item.username);
                
                // Clear search state first
                handleCancel();
                
                // Navigate after a short delay to ensure the UI updated first
                setTimeout(() => {
                  navigation.navigate('UserProfile', { 
                    username: item.username,
                    timestamp: new Date().getTime() 
                  });
                }, 100);
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
              <View style={styles.arrowContainer}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    color: '#1DA1F2',
    fontSize: 15,
  },
  name: {
    color: '#657786',
    marginTop: 2,
  },
  arrowContainer: {
    backgroundColor: '#E8F5FE',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: '#1DA1F2',
    fontWeight: 'bold',
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
});

export default SearchBar; 