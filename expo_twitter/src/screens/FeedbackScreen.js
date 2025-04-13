import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Image
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const { width } = Dimensions.get('window');

const FeedbackScreen = ({ navigation }) => {
  const { user } = useAuth();
  const pagerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [feedback, setFeedback] = useState(null); // like or dislike
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [stats, setStats] = useState(null);
  
  const likeOptions = [
    { id: 1, text: 'Great user interface' },
    { id: 2, text: 'Easy to use' },
    { id: 3, text: 'Fast performance' },
    { id: 4, text: 'Good content' },
    { id: 5, text: 'Helpful features' }
  ];
  
  const dislikeOptions = [
    { id: 6, text: 'Confusing interface' },
    { id: 7, text: 'Slow performance' },
    { id: 8, text: 'Poor content quality' },
    { id: 9, text: 'Missing features' },
    { id: 10, text: 'Too many bugs' }
  ];
  
  const goToNextPage = () => {
    if (pagerRef.current) {
      pagerRef.current.setPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (pagerRef.current && currentPage > 0) {
      pagerRef.current.setPage(currentPage - 1);
    }
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleFeedbackSelect = (value) => {
    setFeedback(value);
    setSelectedOptions([]);
    goToNextPage();
  };
  
  const toggleOption = (option) => {
    if (selectedOptions.some(item => item.id === option.id)) {
      setSelectedOptions(selectedOptions.filter(item => item.id !== option.id));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };
  
  const submitFeedback = async () => {
    if (!feedback) return;
    
    setIsSubmitting(true);
    
    try {
      const feedbackData = {
        user_id: user.id,
        username: user.username,
        sentiment: feedback,
        selected_options: selectedOptions.map(opt => opt.id)
      };
      
      console.log('Submitting feedback:', feedbackData);
      
      // Replace with your API endpoint on AWS EC2
      const response = await axios.post('http://54.147.244.63:8000/api/feedback/', feedbackData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      console.log('Feedback submitted successfully:', response.data);
      
      // Get feedback statistics for visualization
      const statsResponse = await axios.get('http://54.147.244.63:8000/api/feedback/stats/', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      setStats(statsResponse.data);
      setIsSubmitted(true);
      goToNextPage();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Simple bar chart component for feedback visualization
  const FeedbackChart = ({ data }) => {
    if (!data) return <ActivityIndicator size="large" color="#1DA1F2" />;
    
    const maxValue = Math.max(
      data.like_count || 0, 
      data.dislike_count || 0,
      ...(data.options_count || []).map(o => o.count)
    );
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Feedback Results</Text>
        <View style={styles.overallSentiment}>
          <View style={styles.barContainer}>
            <Text style={styles.barLabel}>Likes</Text>
            <View style={styles.barWrapper}>
              <View 
                style={[
                  styles.bar, 
                  styles.likeBar,
                  { width: `${(data.like_count / maxValue) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.barValue}>{data.like_count || 0}</Text>
          </View>
          <View style={styles.barContainer}>
            <Text style={styles.barLabel}>Dislikes</Text>
            <View style={styles.barWrapper}>
              <View 
                style={[
                  styles.bar, 
                  styles.dislikeBar,
                  { width: `${(data.dislike_count / maxValue) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.barValue}>{data.dislike_count || 0}</Text>
          </View>
        </View>
        
        <Text style={styles.chartSubtitle}>Top Feedback Reasons</Text>
        {data.options_count && data.options_count.map((option) => (
          <View key={option.id} style={styles.barContainer}>
            <Text style={styles.barLabel} numberOfLines={1} ellipsizeMode="tail">
              {option.text}
            </Text>
            <View style={styles.barWrapper}>
              <View 
                style={[
                  styles.bar, 
                  option.id <= 5 ? styles.likeBar : styles.dislikeBar,
                  { width: `${(option.count / maxValue) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.barValue}>{option.count}</Text>
          </View>
        ))}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Feedback</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Pager */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => handlePageChange(e.nativeEvent.position)}
        scrollEnabled={false}
      >
        {/* Page 1: Like or Dislike */}
        <View key="1" style={styles.page}>
          <Text style={styles.pageTitle}>How do you feel about our app?</Text>
          <View style={styles.feedbackOptions}>
            <TouchableOpacity 
              style={styles.feedbackOption} 
              onPress={() => handleFeedbackSelect('like')}
            >
              <View style={styles.feedbackIconContainer}>
                <Text style={styles.feedbackIcon}>👍</Text>
              </View>
              <Text style={styles.feedbackText}>I like it</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.feedbackOption} 
              onPress={() => handleFeedbackSelect('dislike')}
            >
              <View style={styles.feedbackIconContainer}>
                <Text style={styles.feedbackIcon}>👎</Text>
              </View>
              <Text style={styles.feedbackText}>I don't like it</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Page 2: Specific Feedback Options */}
        <View key="2" style={styles.page}>
          <Text style={styles.pageTitle}>
            {feedback === 'like' ? 
              'What do you like about our app?' : 
              'What don\'t you like about our app?'}
          </Text>
          <FlatList
            data={feedback === 'like' ? likeOptions : dislikeOptions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  selectedOptions.some(opt => opt.id === item.id) && styles.selectedOption
                ]}
                onPress={() => toggleOption(item)}
              >
                <Text style={styles.optionText}>{item.text}</Text>
                {selectedOptions.some(opt => opt.id === item.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
            style={styles.optionsList}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.backButtonBottom} onPress={goToPreviousPage}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, selectedOptions.length === 0 && styles.disabledButton]} 
              onPress={submitFeedback}
              disabled={selectedOptions.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Page 3: Results Visualization */}
        <View key="3" style={styles.page}>
          <Text style={styles.pageTitle}>Feedback Results</Text>
          <Text style={styles.pageSubtitle}>
            Thank you for your feedback! Here's what others think:
          </Text>
          
          <FeedbackChart data={stats} />
          
          <TouchableOpacity 
            style={styles.doneButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </PagerView>
      
      {/* Page indicator */}
      <View style={styles.pageIndicator}>
        {[0, 1, 2].map((page) => (
          <View
            key={page}
            style={[
              styles.dot,
              currentPage === page ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
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
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#14171A',
    marginBottom: 30,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#657786',
    marginBottom: 30,
    textAlign: 'center',
  },
  feedbackOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  feedbackOption: {
    alignItems: 'center',
    width: '45%',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    backgroundColor: '#F5F8FA',
  },
  feedbackIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackIcon: {
    fontSize: 40,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171A',
  },
  optionsList: {
    width: '100%',
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  selectedOption: {
    borderColor: '#1DA1F2',
    backgroundColor: '#E8F5FE',
  },
  optionText: {
    fontSize: 16,
    color: '#14171A',
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
    color: '#1DA1F2',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  backButtonBottom: {
    backgroundColor: '#657786',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
  },
  disabledButton: {
    backgroundColor: '#AAB8C2',
  },
  doneButton: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#1DA1F2',
  },
  inactiveDot: {
    backgroundColor: '#E1E8ED',
  },
  chartContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#F5F8FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  chartSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  overallSentiment: {
    marginBottom: 20,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabel: {
    width: 100,
    fontSize: 14,
    color: '#657786',
  },
  barWrapper: {
    flex: 1,
    height: 20,
    backgroundColor: '#E1E8ED',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
  },
  likeBar: {
    backgroundColor: '#4CAF50',
  },
  dislikeBar: {
    backgroundColor: '#F44336',
  },
  barValue: {
    width: 30,
    textAlign: 'right',
    fontSize: 14,
    color: '#657786',
    marginLeft: 5,
  },
});

export default FeedbackScreen; 