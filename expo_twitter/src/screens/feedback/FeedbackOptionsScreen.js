import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const FeedbackOptionsScreen = ({ likesApp, onSwipeNext }) => {
  const navigation = useNavigation();
  const [selectedOptions, setSelectedOptions] = useState([]);
  
  // Define different options based on whether the user likes or dislikes the app
  const options = likesApp 
    ? [
        'User Interface',
        'Performance',
        'Features',
        'Ease of Use',
        'Content Quality',
        'Social Interaction',
        'Notifications',
        'Search Functionality',
        'Profile Customization',
      ]
    : [
        'Confusing Interface',
        'Slow Performance',
        'Missing Features',
        'Difficult to Use',
        'Poor Content Quality',
        'Limited Social Interaction',
        'Too Many Notifications',
        'Poor Search Results',
        'Limited Customization',
      ];

  const toggleOption = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(item => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleContinue = () => {
    if (selectedOptions.length > 0) {
      onSwipeNext(selectedOptions);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {likesApp ? 'What do you like about our app?' : 'What could be improved?'}
          </Text>
          <Text style={styles.subtitle}>
            Select all that apply
          </Text>

          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOptions.includes(option) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleOption(option)}
              >
                <Text style={[
                  styles.optionText,
                  selectedOptions.includes(option) && styles.optionTextSelected,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedOptions.length === 0 && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={selectedOptions.length === 0}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: width,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1DA1F2',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#657786',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: '#F5F8FA',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  optionButtonSelected: {
    backgroundColor: '#E8F5FE',
    borderColor: '#1DA1F2',
  },
  optionText: {
    fontSize: 16,
    color: '#14171A',
  },
  optionTextSelected: {
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
    marginBottom: 30,
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

export default FeedbackOptionsScreen; 