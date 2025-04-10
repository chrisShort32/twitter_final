import AsyncStorage from '@react-native-async-storage/async-storage';

const TOPICS_KEY = '@topics';

export const DatabaseService = {
  saveTopic: async (topicData) => {
    try {
      // Get existing topics
      const existingTopicsJson = await AsyncStorage.getItem(TOPICS_KEY);
      const existingTopics = existingTopicsJson ? JSON.parse(existingTopicsJson) : [];
      
      // Add new topic with timestamp
      const newTopic = {
        ...topicData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      // Save updated topics
      const updatedTopics = [...existingTopics, newTopic];
      await AsyncStorage.setItem(TOPICS_KEY, JSON.stringify(updatedTopics));
      
      return newTopic;
    } catch (error) {
      console.error('Error saving topic:', error);
      throw error;
    }
  },

  getTopics: async () => {
    try {
      const topicsJson = await AsyncStorage.getItem(TOPICS_KEY);
      return topicsJson ? JSON.parse(topicsJson) : [];
    } catch (error) {
      console.error('Error getting topics:', error);
      throw error;
    }
  },

  searchTopics: async (keyword) => {
    try {
      const topics = await DatabaseService.getTopics();
      return topics.filter(topic => 
        topic.topic.toLowerCase().includes(keyword.toLowerCase()) ||
        topic.description.toLowerCase().includes(keyword.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching topics:', error);
      throw error;
    }
  },
}; 