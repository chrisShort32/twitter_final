import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { submitFeedback } from '../../api/authApi';

const { width } = Dimensions.get('window');

const FeedbackSubmitScreen = ({ feedbackData, onSwipeNext }) => {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double-submission
    
    setIsSubmitting(true);
    setError(null);
    setAttempts(prev => prev + 1);
    
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
      
      // If result exists and has success property true
      if (result && result.success) {
        console.log('✅ Feedback submitted successfully, moving to results screen');
        
        // Brief delay to ensure things settle before transition
        setTimeout(() => {
          onSwipeNext();
        }, 500);
      } else {
        console.error('❌ Feedback submission failed:', result ? result.error : 'Unknown error');
        
        // Show alert with error
        Alert.alert(
          "Submission Error", 
          result?.error || "Failed to submit feedback",
          [{ text: "Try Again", onPress: () => setIsSubmitting(false) }]
        );
        
        setError(result?.error || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('❌ Unexpected error during feedback submission:', err);
      
      // Show alert with error
      Alert.alert(
        "Error", 
        `An unexpected error occurred: ${err.message || err}`,
        [{ text: "Try Again", onPress: () => setIsSubmitting(false) }]
      );
      
      setError('An unexpected error occurred: ' + (err.message || err));
    } finally {
      // Keep submitting state true if successful to prevent double-submission
      // It will be reset when component unmounts
    }
  };

  // Handle case of too many failed submission attempts
  if (attempts > 3 && error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Submission Error</Text>
          
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>
              We're having trouble submitting your feedback
            </Text>
            
            <Text style={styles.errorText}>{error}</Text>
            
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.homeButtonText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled
          ]}
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
  submitButtonDisabled: {
    backgroundColor: '#AAB8C2',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#FFF8F8',
    borderWidth: 1,
    borderColor: '#E0245E',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0245E',
    marginBottom: 10,
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FeedbackSubmitScreen; 