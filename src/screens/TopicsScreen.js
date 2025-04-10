import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddTopic from '../components/AddTopic';
import axios from 'axios';

const { width } = Dimensions.get('window');

const TopicsScreen = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Animation values
  const position = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderMove: (_, gestureState) => {
        position.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100 && currentPage > 0) {
          // Swipe right
          navigateToPage(currentPage - 1);
        } else if (gestureState.dx < -100 && currentPage < 3) {
          // Swipe left
          navigateToPage(currentPage + 1);
        } else {
          // Return to current page
          Animated.spring(position, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const navigateToPage = (pageIndex) => {
    Animated.timing(position, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(pageIndex);
    });
  };

  // Fetch topics from the API
  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/topics/');
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
      Alert.alert('Error', 'Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  // Add a new topic
  const handleAddTopic = async (topicData) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/topics/', {
        title: topicData.topic,
        description: topicData.description,
        location: null,
      });
      
      setTopics([...topics, response.data]);
      Alert.alert('Success', 'Topic added successfully');
      return response.data;
    } catch (error) {
      console.error('Error adding topic:', error);
      Alert.alert('Error', 'Failed to add topic');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Search for topics
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = topics.filter(
      topic => 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
    // Move to the search results page after searching
    navigateToPage(1);
  };

  // Show topic details with zoom effect
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    navigateToPage(2);
  };

  // Load topics when component mounts
  useEffect(() => {
    fetchTopics();
  }, []);

  // Render Add Page
  const renderAddPage = () => (
    <View style={styles.pageContainer}>
      <Text style={styles.pageTitle}>Add New Topic</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Topic</Text>
      </TouchableOpacity>
      
      <FlatList
        data={topics}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.topicItem}
            onPress={() => handleTopicSelect(item)}
          >
            <Text style={styles.topicTitle}>{item.title}</Text>
            <Text style={styles.topicDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>
            No topics available. Add your first topic!
          </Text>
        }
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <AddTopic
              onClose={() => setModalVisible(false)}
              onSubmit={handleAddTopic}
            />
          </View>
        </View>
      </Modal>
    </View>
  );

  // Render Search Page
  const renderSearchPage = () => (
    <View style={styles.pageContainer}>
      <Text style={styles.pageTitle}>Search Topics</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by keyword..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.topicItem}
            onPress={() => handleTopicSelect(item)}
          >
            <Text style={styles.topicTitle}>{item.title}</Text>
            <Text style={styles.topicDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>
            {searchQuery.trim() ? 'No matching topics found' : 'Enter a keyword to search'}
          </Text>
        }
      />
    </View>
  );

  // Render Display Page
  const renderDisplayPage = () => (
    <View style={styles.pageContainer}>
      <Text style={styles.pageTitle}>Topic Details</Text>
      {selectedTopic ? (
        <View style={styles.topicDetailContainer}>
          <Text style={styles.detailTitle}>{selectedTopic.title}</Text>
          <Text style={styles.detailDescription}>{selectedTopic.description}</Text>
          {selectedTopic.location && (
            <Text style={styles.detailLocation}>Location: {selectedTopic.location}</Text>
          )}
          <Text style={styles.detailDate}>
            Created: {new Date(selectedTopic.created_at).toLocaleDateString()}
          </Text>
        </View>
      ) : (
        <Text style={styles.emptyListText}>Select a topic to view details</Text>
      )}
    </View>
  );

  // Render Zoom Page
  const renderZoomPage = () => (
    <View style={styles.pageContainer}>
      <Text style={styles.pageTitle}>Map View</Text>
      {selectedTopic ? (
        <View style={styles.mapContainer}>
          <Text style={styles.mapPlaceholder}>
            Map view would display here with zoom functionality for location: 
            {selectedTopic.location || 'No location specified'}
          </Text>
          {/* Map component would go here in a real implementation */}
        </View>
      ) : (
        <Text style={styles.emptyListText}>Select a topic to view on map</Text>
      )}
    </View>
  );

  // Pages to be rendered based on currentPage state
  const pages = [
    renderAddPage,
    renderSearchPage,
    renderDisplayPage,
    renderZoomPage,
  ];

  // Animated value for the current page
  const translateX = position.interpolate({
    inputRange: [-width, 0, width],
    outputRange: [-(width * 0.1), 0, width * 0.1],
  });

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      )}
      
      <Animated.View
        style={[
          styles.content,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {pages[currentPage]()}
      </Animated.View>
      
      <View style={styles.paginationContainer}>
        {[0, 1, 2, 3].map((page) => (
          <TouchableOpacity
            key={page}
            style={[
              styles.paginationDot,
              currentPage === page && styles.activePaginationDot,
            ]}
            onPress={() => navigateToPage(page)}
          />
        ))}
      </View>
      
      <View style={styles.helpTextContainer}>
        <Text style={styles.helpText}>
          Swipe left/right to navigate between pages
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8fa',
  },
  content: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#14171A',
  },
  addButton: {
    backgroundColor: '#1DA1F2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  topicItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#14171A',
  },
  topicDescription: {
    fontSize: 14,
    color: '#657786',
  },
  emptyListText: {
    textAlign: 'center',
    padding: 20,
    color: '#657786',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  searchButton: {
    backgroundColor: '#1DA1F2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  topicDetailContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#14171A',
  },
  detailDescription: {
    fontSize: 16,
    marginBottom: 15,
    color: '#14171A',
    lineHeight: 24,
  },
  detailLocation: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 10,
  },
  detailDate: {
    fontSize: 14,
    color: '#AAB8C2',
  },
  mapContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    textAlign: 'center',
    color: '#657786',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#AAB8C2',
    marginHorizontal: 5,
  },
  activePaginationDot: {
    backgroundColor: '#1DA1F2',
    width: 12,
    height: 12,
  },
  helpTextContainer: {
    paddingBottom: 10,
    alignItems: 'center',
  },
  helpText: {
    color: '#657786',
    fontSize: 12,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000,
  },
});

export default TopicsScreen; 