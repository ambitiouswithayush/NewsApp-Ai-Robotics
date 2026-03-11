import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import NewsCard from '../components/NewsCard';
import { useNewsStore } from '../store/useNewsStore';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { searchNews, searchResults, isSearching, clearSearch } = useNewsStore();

  const handleSearch = () => {
    if (!query.trim()) return;
    searchNews(query);
  };

  const handleClear = () => {
    setQuery('');
    clearSearch();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QUERY DATABASE</Text>
      </View>

      <View style={styles.searchBarContainer}>
        <View style={styles.searchIcon}>
          <Search color="#38bdf8" size={20} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search topics, companies, technologies..."
          placeholderTextColor="#52525b"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X color="#a1a1aa" size={20} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {isSearching ? (
          <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 40 }} />
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={{ height: 400, borderRadius: 24, overflow: 'hidden', marginBottom: 24 }}>
                {/* We can refactor NewsCard to support a 'compact' view later */}
                <NewsCard article={item} isActive={true} cardHeight={400} />
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Search color="#27272a" size={64} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Enter a query to access the archives.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', color: '#ffffff', letterSpacing: 2, textTransform: 'uppercase' },
  searchBarContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#18181b', borderWidth: 1, borderColor: '#27272a',
    borderRadius: 12, marginHorizontal: 24, paddingHorizontal: 16, height: 50, marginBottom: 16,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 16 },
  clearButton: { padding: 4 },
  content: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#52525b', fontSize: 16, textAlign: 'center' },
});
