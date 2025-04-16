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
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { VictoryPie, VictoryBar, VictoryChart, VictoryTheme, VictoryAxis } from 'victory-native';
import { getFeedbackStats } from '../../api/authApi';

// Ignore warnings that might be related to VictoryChart rendering
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
  'Animated: `useNativeDriver`'
]);

const { width } = Dimensions.get('window');

// Test data in case the backend doesn't respond - used as a fallback
const TEST_DATA = {
  total_responses: 6,
  likes: {
    count: 5,
    reasons: {
      "User Interface": 3,
      "Ease of Use": 4, 
      "Social Interaction": 2,
      "Search Functionality": 3,
      "Content Quality": 2,
      "Notifications": 1
    }
  },
  dislikes: {
    count: 1,
    reasons: {
      "Too Many Notifications": 1,
      "Poor Search Results": 1,
      "Limited Customization": 1
    }
  }
};

const FeedbackResultsScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [activeView, setActiveView] = useState('overview'); 
  const mountTimeRef = useRef(Date.now());
  const fetchAttemptsRef = useRef(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedAnyData, setHasLoadedAnyData] = useState(false);
  
  // Helper to refresh data with visual indicator
  const refreshData = async (showIndicator = true) => {
    if (showIndicator) {
      setIsRefreshing(true);
    }
    
    try {
      await fetchStats();
    } finally {
      if (showIndicator) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  // Fetch stats when screen gets focus
  useFocusEffect(
    React.useCallback(() => {
      console.log(`📊 Results screen gained focus at ${Date.now()}`);
      
      // If we haven't loaded data yet, do a full load
      if (!hasLoadedAnyData) {
        console.log("🔄 First time focus - doing full load");
        setIsLoading(true);
        refreshData(false);
      } else {
        // Otherwise do a background refresh
        console.log("🔄 Refreshing in background");
        refreshData(false);
      }
      
      // Set up refresh interval
      const refreshInterval = setInterval(() => {
        console.log(`🔄 Auto-refreshing stats data (attempt ${fetchAttemptsRef.current + 1})`);
        refreshData(false);
      }, 8000); // Longer interval to reduce network requests
      
      return () => {
        console.log('📊 Results screen lost focus, clearing interval');
        clearInterval(refreshInterval);
      };
    }, [hasLoadedAnyData])
  );

  // Also fetch when first mounted
  useEffect(() => {
    console.log(`📊 Results screen mounted at ${mountTimeRef.current}`);
    
    // Reset state on mount
    setIsLoading(true);
    setError(null);
    setStatsData(null);
    fetchAttemptsRef.current = 0;
    
    fetchStats();
    
    return () => {
      console.log(`📊 Results screen unmounting, was mounted at ${mountTimeRef.current}`);
    };
  }, []);

  const fetchStats = async () => {
    // Track fetch attempts
    fetchAttemptsRef.current += 1;
    const currentAttempt = fetchAttemptsRef.current;
    
    if (!isLoading && statsData === null) {
      setIsLoading(true);
    }
    
    try {
      console.log(`📊 Fetching stats (attempt ${currentAttempt})...`);
      const result = await getFeedbackStats();
      
      // Log abbreviated response to avoid console spam
      if (result.success) {
        console.log(`✅ Stats fetch attempt ${currentAttempt} successful!`);
        setHasLoadedAnyData(true);
      } else {
        console.error(`❌ Stats fetch attempt ${currentAttempt} failed:`, result.error);
      }
      
      // Only update state if this is still the latest request
      if (currentAttempt === fetchAttemptsRef.current) {
        if (result.success && result.data) {
          setStatsData(result.data);
          setError(null);
        } else {
          // After multiple failed attempts, use test data as fallback
          if (fetchAttemptsRef.current > 3 && !statsData) {
            console.log("⚠️ Multiple failures, using test data as fallback");
            setStatsData(TEST_DATA);
            setError("Using sample data (couldn't connect to server)");
          } else {
            setError(result.error || 'Failed to retrieve feedback statistics');
          }
          
          // Show alert on first error only
          if (statsData === null && currentAttempt <= 2) {
            Alert.alert(
              "Data Loading Issue", 
              "We're having trouble loading feedback statistics. We'll keep trying to connect to the server.",
              [{ text: "OK" }]
            );
          }
        }
        
        setIsLoading(false);
      }
    } catch (err) {
      console.error(`❌ Stats fetch attempt ${currentAttempt} exception:`, err);
      
      // Only update state if this is still the latest request
      if (currentAttempt === fetchAttemptsRef.current) {
        // After multiple failed attempts, use test data as fallback
        if (fetchAttemptsRef.current > 3 && !statsData) {
          console.log("⚠️ Multiple failures, using test data as fallback");
          setStatsData(TEST_DATA);
          setError("Using sample data (couldn't connect to server)");
        } else {
          setError(`An error occurred: ${err.message || 'Unknown error'}`);
        }
        
        setIsLoading(false);
        
        // Show alert on first error only
        if (statsData === null && currentAttempt <= 2) {
          Alert.alert(
            "Connection Error", 
            "We're having trouble connecting to the server. We'll use sample data if this continues.",
            [{ text: "OK" }]
          );
        }
      }
    }
  };

  const handleDone = () => {
    navigation.navigate('Home');
  };

  const renderOverview = () => {
    if (isLoading && !statsData) {
      return (
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color="#1DA1F2" />
          <Text style={styles.loadingText}>Loading statistics...</Text>
          <Image 
            source={require('../../../assets/chart-loading.gif')} 
            style={styles.loadingImage}
            resizeMode="contain"
          />
        </View>
      );
    }
    
    if (!statsData) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No feedback data available yet</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refreshData()}
          >
            <Text style={styles.retryButtonText}>Refresh Data</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const { likes, dislikes, total_responses } = statsData;
    
    // If there are no responses yet
    if (total_responses === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No feedback has been submitted yet</Text>
          <Text style={styles.subtleText}>Your feedback was the first one!</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refreshData()}
          >
            <Text style={styles.retryButtonText}>Refresh Data</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Ensure likes and dislikes counts exist, default to 0 if not
    const likesCount = likes?.count || 0;
    const dislikesCount = dislikes?.count || 0;
    
    const pieChartData = [
      { x: 'Like', y: likesCount, color: '#1DA1F2' },
      { x: 'Dislike', y: dislikesCount, color: '#E0245E' },
    ];
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Overall Feedback</Text>
        <Text style={styles.chartSubtitle}>Total Responses: {total_responses}</Text>
        
        {isRefreshing && (
          <View style={styles.refreshIndicator}>
            <ActivityIndicator size="small" color="#1DA1F2" />
          </View>
        )}
        
        {error && (
          <Text style={styles.dataWarning}>{error}</Text>
        )}
        
        <VictoryPie
          data={pieChartData}
          width={300}
          height={300}
          colorScale={pieChartData.map(item => item.color)}
          style={{ 
            labels: { fontSize: 14, fill: '#657786' },
            parent: { marginTop: 20 }
          }}
          labelRadius={({ innerRadius }) => innerRadius + 65}
          animate={{
            duration: 500,
            easing: "bounce"
          }}
        />
        
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#1DA1F2' }]} />
            <Text style={styles.legendText}>Like ({likesCount})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#E0245E' }]} />
            <Text style={styles.legendText}>Dislike ({dislikesCount})</Text>
          </View>
        </View>
        
        <View style={styles.percentageView}>
          <Text style={styles.percentageText}>
            {likesCount + dislikesCount > 0 
              ? `${Math.round((likesCount / (likesCount + dislikesCount)) * 100)}% of users like the app`
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

  const renderReasonChart = (type) => {
    if (isLoading && !statsData) {
      return (
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color="#1DA1F2" />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      );
    }
    
    if (!statsData) return null;
    
    const data = type === 'likes' ? statsData.likes?.reasons : statsData.dislikes?.reasons;
    
    if (!data || Object.keys(data).length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refreshData()}
          >
            <Text style={styles.retryButtonText}>Refresh Data</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Convert object to array and sort by count
    const sortedData = Object.entries(data)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Show top 5 reasons
    
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
        
        <VictoryChart
          width={width - 40}
          height={300}
          domainPadding={{ x: 30 }}
          theme={VictoryTheme.material}
          animate={{
            duration: 500,
            onLoad: { duration: 300 }
          }}
        >
          <VictoryAxis
            tickFormat={(label) => ''}
            style={{
              axis: { stroke: '#E1E8ED' },
              grid: { stroke: 'none' },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => `${t}`}
            style={{
              axis: { stroke: '#E1E8ED' },
              grid: { stroke: '#F5F8FA' },
            }}
          />
          <VictoryBar
            data={sortedData}
            x="reason"
            y="count"
            style={{
              data: {
                fill: type === 'likes' ? '#1DA1F2' : '#E0245E',
                width: 25,
              },
            }}
          />
        </VictoryChart>
        
        <View style={styles.reasonsLegend}>
          {sortedData.map((item, index) => (
            <View key={index} style={styles.reasonLegendItem}>
              <View 
                style={[
                  styles.reasonLegendColor, 
                  { backgroundColor: type === 'likes' ? '#1DA1F2' : '#E0245E' }
                ]} 
              />
              <Text style={styles.reasonLegendText}>
                {item.reason} ({item.count})
              </Text>
            </View>
          ))}
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
        {error && !statsData ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refreshData()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.title}>Feedback Results</Text>
            <Text style={styles.subtitle}>See what other users think about our app</Text>
            
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
            
            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDone}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
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
  loadingImage: {
    width: 200,
    height: 120,
    marginTop: 20,
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
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 8,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
    color: '#657786',
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
  subtleText: {
    fontSize: 14,
    color: '#AAB8C2',
    marginTop: 8,
    textAlign: 'center',
  },
  reasonsLegend: {
    marginTop: 20,
    width: '100%',
  },
  reasonLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reasonLegendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  reasonLegendText: {
    fontSize: 14,
    color: '#14171A',
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
});

export default FeedbackResultsScreen; 