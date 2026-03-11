import 'react-native-gesture-handler';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, Dimensions, ViewToken, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import NewsCard from '../components/NewsCard';
import { useNewsStore, NewsArticle } from '../store/useNewsStore';

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  const { feed, fetchNews, isLoading, hasMore, error, activeCategory, setActiveCategory } = useNewsStore();
  const [activeViewableItems, setActiveViewableItems] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);
  
  const tabBarHeight = useBottomTabBarHeight();
  const availableHeight = height - tabBarHeight;
  
  useEffect(() => {
    // Initial fetch
    fetchNews(true);
  }, []);

  const handleTabChange = (category: 'AI' | 'Robotics') => {
    if (category !== activeCategory) {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
      setActiveCategory(category);
    }
  };

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: {
        itemVisiblePercentThreshold: 60,
      },
      onViewableItemsChanged: ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        setActiveViewableItems(viewableItems.map(item => item.key));
      },
    },
  ]);

  const renderItem = useCallback(({ item }: { item: NewsArticle }) => {
    return (
      <View style={{ height: availableHeight }}>
         <NewsCard 
           article={item} 
           isActive={activeViewableItems.includes(item.id)}
           cardHeight={availableHeight}
         />
      </View>
    );
  }, [activeViewableItems, availableHeight]);

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No news found in the database yet.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      
      {/* Floating Category Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeCategory === 'AI' && styles.activeTab]}
          onPress={() => handleTabChange('AI')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeCategory === 'AI' && styles.activeTabText]}>AI NEWS</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeCategory === 'Robotics' && styles.activeTab]}
          onPress={() => handleTabChange('Robotics')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeCategory === 'Robotics' && styles.activeTabText]}>ROBOTICS</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={feed}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        windowSize={3}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        onEndReached={() => {
          if (hasMore && !isLoading) {
            fetchNews();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabContainer: {
    position: 'absolute',
    top: 55, // Account for dynamic island
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: '#ffffff',
  },
  tabText: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '800',
  },
  loader: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  emptyContainer: {
    flex: 1,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  emptyText: {
    color: '#a1a1aa',
    fontSize: 18,
    textAlign: 'center',
  }
});
