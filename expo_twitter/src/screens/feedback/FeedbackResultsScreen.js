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
import { VictoryPie, VictoryBar, VictoryChart, VictoryTheme, VictoryAxis } from 'victory-native';
import { getFeedbackStats } from '../../api/authApi';

// Ignore warnings that might be related to VictoryChart rendering
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
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true); // Start with true to show loading indicator
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState(null); // Start with null to force API fetch
  const [activeView, setActiveView] = useState('overview'); 
  const mountTimeRef = useRef(Date.now());
  const fetchAttemptsRef = useRef(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedAnyData, setHasLoadedAnyData] = useState(false);
  const [chartKey, setChartKey] = useState(Date.now()); // Key to force chart re-renders
  
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
          // Force chart re-render after refresh
          setChartKey(Date.now());
        }, 500);
      }
    }
  };

  // Fetch stats when screen gets focus
  useFocusEffect(
    React.useCallback(() => {
      console.log(`📊 Results screen gained focus at ${Date.now()}`);
      
      // Force refresh of charts by updating the key
      setChartKey(Date.now());
      
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

  // Also fetch when first mounted
  useEffect(() => {
    console.log(`📊 Results screen mounted at ${mountTimeRef.current}`);
    
    // Force immediate data fetch
    const initialFetch = async () => {
      console.log('📊 Initial data fetch on mount...');
      setIsLoading(true);
      
      try {
        // Try to get real data first
        const result = await getFeedbackStats();
        if (result && result.success && result.data) {
          console.log('✅ Initial fetch successful:', result.data);
          setStatsData(result.data);
          setHasLoadedAnyData(true);
          setError(null);
        } else {
          console.warn('⚠️ Initial fetch returned error, using test data:', result?.error);
          setStatsData(TEST_DATA);
          setError("Using sample data (server error)");
          setHasLoadedAnyData(true);
        }
      } catch (err) {
        console.error('❌ Initial fetch failed:', err);
        setStatsData(TEST_DATA);
        setError("Using sample data (connection error)");
        setHasLoadedAnyData(true);
      } finally {
        setIsLoading(false);
        // Force chart re-render
        setChartKey(Date.now() + 1);
      }
    };
    
    // Execute initial fetch
    initialFetch();
    
    // Set a backup timer to make sure we render something if API is slow
    const forceRenderTimer = setTimeout(() => {
      console.log('⏱️ Force render timer triggered');
      if (!hasLoadedAnyData) {
        console.log('⚠️ No data loaded yet, using test data as fallback');
        setStatsData(TEST_DATA);
        setHasLoadedAnyData(true);
        setIsLoading(false);
      }
      setChartKey(Date.now() + 2);
    }, 3000); // Shorter timeout
    
    return () => {
      console.log(`📊 Results screen unmounting, was mounted at ${mountTimeRef.current}`);
      clearTimeout(forceRenderTimer);
    };
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
          // Force chart re-render
          setChartKey(Date.now());
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
    
    // Ensure likes and dislikes counts exist, default to 0 if not
    const likesCount = likes?.count || 0;
    const dislikesCount = dislikes?.count || 0;
    
    const pieChartData = [
      { x: 'Like', y: likesCount, color: '#1DA1F2' },
      { x: 'Dislike', y: dislikesCount, color: '#E0245E' },
    ];
    
    // If no data or all zeros, show placeholder data
    if (likesCount === 0 && dislikesCount === 0) {
      pieChartData[0].y = 1;
      pieChartData[1].y = 1;
    }
    
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
        
        <View style={styles.chartWrapper} key={`pie-${chartKey}`}>
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
        </View>
        
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
    if (isLoading && !hasLoadedAnyData) {
      return (
        <View style={styles.loadingView}>
          <ActivityIndicator size="large" color="#1DA1F2" />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      );
    }
    
    if (!safeStatsData) return null;
    
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
    
    // Ensure we have valid data for the chart
    if (sortedData.length === 0) {
      sortedData.push({ reason: 'No data', count: 1 });
    }
    
    // Create a fixed domain for the chart to prevent jumpy rendering
    const maxCount = Math.max(...sortedData.map(item => item.count), 3); // At least 3 for scale
    
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
        
        <View style={styles.chartWrapper} key={`bar-${type}-${chartKey}`}>
          <VictoryChart
            width={width - 40}
            height={300}
            domainPadding={{ x: 30 }}
            theme={VictoryTheme.material}
            domain={{ y: [0, maxCount + 1] }}
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
              tickValues={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(n => n <= maxCount + 1)}
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
        </View>
        
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
  loadingAnimation: {
    marginTop: 20,
    paddingHorizontal: 20,
    height: 100,
  },
  chartWrapper: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default FeedbackResultsScreen; 