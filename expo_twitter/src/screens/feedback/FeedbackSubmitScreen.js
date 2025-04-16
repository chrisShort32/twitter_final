import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { submitFeedback } from '../../api/authApi';

const { width } = Dimensions.get('window');

const FeedbackSubmitScreen = ({ feedbackData, onSwipeNext }) => {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting feedback:', {
        likes_app: feedbackData.likesApp,
        selected_reasons: feedbackData.selectedOptions
      });
      
      const feedback = {
        likes_app: feedbackData.likesApp,
        selected_reasons: feedbackData.selectedOptions
      };
      
      const result = await submitFeedback(feedback);
      
      console.log('Feedback submission result:', result);
      
      // If result exists and doesn't have an error property
      if (result) {
        console.log('Feedback submitted successfully, navigating to results');
        // Move to the results screen
        onSwipeNext();
      } else {
        console.error('Feedback submission failed:', result ? result.error : 'Unknown error');
        setError(result?.error || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('Unexpected error during feedback submission:', err);
      setError('An unexpected error occurred: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Review Your Feedback</Text>
        
        <View style={styles.feedbackSummary}>
          <Text style={styles.summaryTitle}>
            You {feedbackData.likesApp ? 'like' : 'don\'t like'} our app
          </Text>
          
          <Text style={styles.reasonsTitle}>
            {feedbackData.likesApp ? 'What you like:' : 'What could be improved:'}
          </Text>
          
          <View style={styles.reasonsList}>
            {feedbackData.selectedOptions.map((reason, index) => (
              <View key={index} style={styles.reasonItem}>
                <Text style={styles.reasonText}>• {reason}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: width,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1DA1F2',
    textAlign: 'center',
  },
  feedbackSummary: {
    backgroundColor: '#F5F8FA',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#14171A',
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#657786',
  },
  reasonsList: {
    marginBottom: 10,
  },
  reasonItem: {
    marginBottom: 5,
  },
  reasonText: {
    fontSize: 16,
    color: '#14171A',
  },
  errorText: {
    color: '#E0245E',
    marginBottom: 15,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FeedbackSubmitScreen; 