import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  LogBox,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getFeedbackStats } from '../../api/authApi';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
  'Animated: `useNativeDriver`'
]);

const { width } = Dimensions.get('window');

// Test data in case the backend doesn't respond - used as a fallback, aligned with real DB
const TEST_DATA = {
  total_responses: 14,
  likes: {
    count: 11,
    reasons: {
      "User Interface": 6,
      "Ease of Use": 5,
      "Social Interaction": 3,
      "Search Functionality": 5,
      "Content Quality": 2,
      "Performance": 5,
      "Features": 3
    }
  },
  dislikes: {
    count: 3,
    reasons: {
      "Too Many Notifications": 1,
      "Poor Search Results": 2,
      "Limited Customization": 1
    }
  }
};

const FeedbackResultsScreen = () => {
  console.log('📊 FeedbackResultsScreen rendered at:', Date.now());
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState(TEST_DATA);
  const [activeView, setActiveView] = useState('overview'); 
  const mountTimeRef = useRef(Date.now());
  const fetchAttemptsRef = useRef(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedAnyData, setHasLoadedAnyData] = useState(true);
  
  // Helper to refresh data with visual indicator
  const refreshData = async (showIndicator = true) => {
    if (showIndicator) {
      setIsRefreshing(true);
    }
    
    try {
      await fetchStats();
    } finally {
      if (showIndicator) {
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500);
      }
    }
  };

  // Fetch stats when screen gets focus
  useFocusEffect(
    React.useCallback(() => {
      console.log(`📊 Results screen gained focus at ${Date.now()}`);
      
      // Fetch fresh data
      refreshData(false);
      
      // Set up refresh interval
      const refreshInterval = setInterval(() => {
        console.log(`🔄 Auto-refreshing stats data (attempt ${fetchAttemptsRef.current + 1})`);
        refreshData(false);
      }, 8000); // Longer interval to reduce network requests
      
      return () => {
        console.log('📊 Results screen lost focus, clearing interval');
        clearInterval(refreshInterval);
      };
    }, [])
  );

  // Log component mount for debugging
  useEffect(() => {
    console.log('📊 FeedbackResultsScreen mounted with test data');
    return () => {
      console.log('📊 FeedbackResultsScreen unmounted');
    };
  }, []);

  // Fetch real data after initial render with test data
  useEffect(() => {
    // Fetch data in the background after component is stable
    const fetchRealData = async () => {
      console.log('📊 Fetching real data in background...');
      try {
        const result = await getFeedbackStats();
        if (result && result.success && result.data) {
          console.log('✅ Background fetch successful:', result.data);
          setStatsData(result.data);
          setError(null);
        } else {
          console.warn('⚠️ Background fetch error:', result?.error);
          if (!statsData) {
            setStatsData(TEST_DATA);
          }
        }
      } catch (err) {
        console.error('❌ Background fetch failed:', err);
        if (!statsData) {
          setStatsData(TEST_DATA);
        }
      }
    };
    
    // Small delay to ensure component is fully rendered first
    const fetchTimer = setTimeout(fetchRealData, 300);
    
    return () => clearTimeout(fetchTimer);
  }, []);

  const fetchStats = async () => {
    // Track fetch attempts
    fetchAttemptsRef.current += 1;
    const currentAttempt = fetchAttemptsRef.current;
    
    try {
      console.log(`📊 Fetching stats (attempt ${currentAttempt})...`);
      const result = await getFeedbackStats();
      
      // Log abbreviated response to avoid console spam
      if (result.success && result.data) {
        console.log(`✅ Stats fetch attempt ${currentAttempt} successful!`);
        
        // Only update state if this is still the latest request
        if (currentAttempt === fetchAttemptsRef.current) {
          setStatsData(result.data);
          setHasLoadedAnyData(true);
          setError(null);
          setIsLoading(false);
          console.log(`📈 Updated stats data:`, result.data);
        }
      } else {
        console.error(`❌ Stats fetch attempt ${currentAttempt} failed:`, result?.error);
        
        // Only update error message, keep showing old or test data
        if (currentAttempt === fetchAttemptsRef.current && !statsData) {
          setStatsData(TEST_DATA);
          setHasLoadedAnyData(true);
          setError("Using sample data - Could not get latest data from server");
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error(`❌ Stats fetch attempt ${currentAttempt} exception:`, err);
      
      // Only update error message, keep showing old or test data
      if (currentAttempt === fetchAttemptsRef.current && !statsData) {
        setStatsData(TEST_DATA);
        setHasLoadedAnyData(true);
        setError(`Using sample data - Connection error: ${err.message || 'Unknown error'}`);
        setIsLoading(false);
      }
    }
  };

  const handleDone = () => {
    navigation.navigate('Home');
  };

  // Make sure we always have data to show
  const safeStatsData = statsData || TEST_DATA;

  // Render pie chart alternative with simple UI
  const renderOverview = () => {
    if (isLoading && !hasLoadedAnyData) {
      return (
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color="#1DA1F2" />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      );
    }
    
    const { likes, dislikes, total_responses } = safeStatsData;
    const likesCount = likes?.count || 0;
    const dislikesCount = dislikes?.count || 0;
    const total = likesCount + dislikesCount;
    const likePercentage = total > 0 ? (likesCount / total) * 100 : 50;
    const dislikePercentage = total > 0 ? (dislikesCount / total) * 100 : 50;
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Overall Feedback</Text>
        <Text style={styles.chartSubtitle}>Total Responses: {total_responses || 0}</Text>
        
        {isRefreshing && (
          <View style={styles.refreshIndicator}>
            <ActivityIndicator size="small" color="#1DA1F2" />
          </View>
        )}
        
        {error && (
          <Text style={styles.dataWarning}>{error}</Text>
        )}
        
        {/* Percentage bars instead of pie chart */}
        <View style={styles.percentageBars}>
          <View style={styles.percentageBarContainer}>
            <Text style={styles.percentageLabel}>Likes ({likesCount})</Text>
            <View style={styles.percentageBarBackground}>
              <View 
                style={[
                  styles.percentageBarFill, 
                  { width: `${likePercentage}%`, backgroundColor: '#1DA1F2' }
                ]} 
              />
            </View>
            <Text style={styles.percentageValue}>{Math.round(likePercentage)}%</Text>
          </View>
          
          <View style={styles.percentageBarContainer}>
            <Text style={styles.percentageLabel}>Dislikes ({dislikesCount})</Text>
            <View style={styles.percentageBarBackground}>
              <View 
                style={[
                  styles.percentageBarFill, 
                  { width: `${dislikePercentage}%`, backgroundColor: '#E0245E' }
                ]} 
              />
            </View>
            <Text style={styles.percentageValue}>{Math.round(dislikePercentage)}%</Text>
          </View>
        </View>
        
        <View style={styles.percentageView}>
          <Text style={styles.percentageText}>
            {total > 0 
              ? `${Math.round(likePercentage)}% of users like the app`
              : "No feedback yet"}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => refreshData()}
          disabled={isRefreshing}
        >
          <Text style={styles.refreshButtonText}>
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render bar chart alternative with simple UI
  const renderReasonChart = (type) => {
    if (isLoading && !hasLoadedAnyData) {
      return (
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color="#1DA1F2" />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      );
    }
    
    const data = type === 'likes' ? safeStatsData.likes?.reasons : safeStatsData.dislikes?.reasons;
    console.log(`📊 Rendering ${type} chart with data:`, data);
    
    // Always have some data to show
    const fallbackData = type === 'likes' 
      ? TEST_DATA.likes.reasons 
      : TEST_DATA.dislikes.reasons;
    
    const reasonsData = data || fallbackData;
    
    if (!reasonsData || Object.keys(reasonsData).length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available for {type === 'likes' ? 'likes' : 'dislikes'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refreshData()}
          >
            <Text style={styles.retryButtonText}>Refresh Data</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Convert object to array, sort by count, and limit to top 5
    const sortedData = Object.entries(reasonsData)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Show top 5 reasons
    
    console.log(`📊 Sorted ${type} data:`, sortedData);
    
    // Find the maximum count for scaling
    const maxCount = Math.max(...sortedData.map(item => item.count));
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>
          {type === 'likes' ? 'Top Reasons Users Like the App' : 'Top Areas for Improvement'}
        </Text>
        
        {isRefreshing && (
          <View style={styles.refreshIndicator}>
            <ActivityIndicator size="small" color="#1DA1F2" />
          </View>
        )}
        
        {error && (
          <Text style={styles.dataWarning}>{error}</Text>
        )}
        
        {/* Simple horizontal bars instead of Victory chart */}
        <View style={styles.horizontalBars}>
          {sortedData.map((item, index) => {
            const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            return (
              <View key={index} style={styles.horizontalBarItem}>
                <Text style={styles.horizontalBarLabel} numberOfLines={1} ellipsizeMode="tail">
                  {item.reason} ({item.count})
                </Text>
                <View style={styles.horizontalBarBackground}>
                  <View 
                    style={[
                      styles.horizontalBarFill, 
                      { 
                        width: `${barWidth}%`, 
                        backgroundColor: type === 'likes' ? '#1DA1F2' : '#E0245E' 
                      }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => refreshData()}
          disabled={isRefreshing}
        >
          <Text style={styles.refreshButtonText}>
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Feedback Results</Text>
          <Text style={styles.subtitle}>See what other users think about our app</Text>
          
          {isLoading && !hasLoadedAnyData ? (
            <View style={styles.fullLoadingContainer}>
              <ActivityIndicator size="large" color="#1DA1F2" />
              <Text style={styles.loadingText}>Loading feedback data...</Text>
            </View>
          ) : (
            <>
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeView === 'overview' && styles.tabButtonActive,
                  ]}
                  onPress={() => setActiveView('overview')}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeView === 'overview' && styles.tabTextActive,
                    ]}
                  >
                    Overview
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeView === 'likes' && styles.tabButtonActive,
                  ]}
                  onPress={() => setActiveView('likes')}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeView === 'likes' && styles.tabTextActive,
                    ]}
                  >
                    Likes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeView === 'dislikes' && styles.tabButtonActive,
                  ]}
                  onPress={() => setActiveView('dislikes')}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeView === 'dislikes' && styles.tabTextActive,
                    ]}
                  >
                    Dislikes
                  </Text>
                </TouchableOpacity>
              </View>
              
              {activeView === 'overview' && renderOverview()}
              {activeView === 'likes' && renderReasonChart('likes')}
              {activeView === 'dislikes' && renderReasonChart('dislikes')}
            </>
          )}
          
          <TouchableOpacity
            style={styles.doneButton}
            onPress={handleDone}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
          
          {/* Manual refresh option for all screens */}
          {!isLoading && (
            <TouchableOpacity
              style={styles.manualRefreshButton}
              onPress={() => {
                Alert.alert(
                  "Refresh Data",
                  "Fetching latest feedback data from server...",
                  [{ text: "OK" }],
                  { cancelable: true }
                );
                refreshData(true);
              }}
            >
              <Text style={styles.manualRefreshText}>
                Refresh All Data
              </Text>
            </TouchableOpacity>
          )}
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
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 400,
  },
  loadingText: {
    marginTop: 15,
    color: '#657786',
    fontSize: 16,
  },
  loadingView: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 400,
  },
  errorText: {
    color: '#E0245E',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  dataWarning: {
    color: '#E0245E',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  retryButton: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#F5F8FA',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#1DA1F2',
  },
  refreshButtonText: {
    color: '#1DA1F2',
    fontSize: 14,
    fontWeight: 'bold',
  },
  refreshIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
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
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#657786',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    width: '100%',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#1DA1F2',
  },
  tabText: {
    fontSize: 16,
    color: '#657786',
  },
  tabTextActive: {
    fontWeight: 'bold',
    color: '#1DA1F2',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    position: 'relative',
    paddingHorizontal: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14171A',
    marginBottom: 5,
    textAlign: 'center',
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#657786',
    marginBottom: 15,
    textAlign: 'center',
  },
  percentageView: {
    marginTop: 10,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14171A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fullLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 400,
  },
  manualRefreshButton: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
  },
  manualRefreshText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  percentageBars: {
    width: '100%',
    marginTop: 20,
  },
  percentageBarContainer: {
    marginBottom: 15,
    width: '100%',
  },
  percentageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#14171A',
  },
  percentageBarBackground: {
    height: 20,
    backgroundColor: '#F5F8FA',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  percentageBarFill: {
    height: '100%',
    borderRadius: 10,
  },
  percentageValue: {
    fontSize: 14,
    color: '#657786',
    marginTop: 2,
    textAlign: 'right',
  },
  horizontalBars: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  horizontalBarItem: {
    marginBottom: 15,
    width: '100%',
  },
  horizontalBarLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#14171A',
    width: '100%',
  },
  horizontalBarBackground: {
    height: 15,
    backgroundColor: '#F5F8FA',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  horizontalBarFill: {
    height: '100%',
    borderRadius: 8,
  },
});

export default FeedbackResultsScreen; 