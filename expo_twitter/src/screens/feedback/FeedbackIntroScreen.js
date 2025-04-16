import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const FeedbackIntroScreen = ({ onSwipeNext }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [feedbackChoice, setFeedbackChoice] = useState(null);

  const handleContinue = () => {
    if (feedbackChoice !== null) {
      onSwipeNext(feedbackChoice);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>App Feedback</Text>
        <Text style={styles.subtitle}>
          We'd love to hear your thoughts on our app!
        </Text>

        <View style={styles.choiceContainer}>
          <TouchableOpacity
            style={[
              styles.choiceButton,
              feedbackChoice === true && styles.choiceButtonSelected,
            ]}
            onPress={() => setFeedbackChoice(true)}
          >
            <Text style={[
              styles.choiceText,
              feedbackChoice === true && styles.choiceTextSelected,
            ]}>
              I like the app 👍
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.choiceButton,
              feedbackChoice === false && styles.choiceButtonSelected,
            ]}
            onPress={() => setFeedbackChoice(false)}
          >
            <Text style={[
              styles.choiceText,
              feedbackChoice === false && styles.choiceTextSelected,
            ]}>
              I don't like the app 👎
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            feedbackChoice === null && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={feedbackChoice === null}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1DA1F2',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    color: '#657786',
  },
  choiceContainer: {
    width: '100%',
    marginBottom: 40,
  },
  choiceButton: {
    backgroundColor: '#F5F8FA',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  choiceButtonSelected: {
    backgroundColor: '#E8F5FE',
    borderColor: '#1DA1F2',
  },
  choiceText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#14171A',
  },
  choiceTextSelected: {
    color: '#1DA1F2',
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  continueButtonDisabled: {
    backgroundColor: '#AAB8C2',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FeedbackIntroScreen; 