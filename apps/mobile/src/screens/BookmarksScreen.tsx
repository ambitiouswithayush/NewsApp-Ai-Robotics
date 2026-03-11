import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark } from 'lucide-react-native';
import NewsCard from '../components/NewsCard';
import { useNewsStore } from '../store/useNewsStore';

export default function BookmarksScreen() {
  const { bookmarks } = useNewsStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SAVED ARCHIVES</Text>
      </View>

      <View style={styles.content}>
        {bookmarks.length > 0 ? (
          <FlatList
            data={bookmarks}
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
            <Bookmark color="#27272a" size={64} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Your personal data vault is currently empty.</Text>
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
  content: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#52525b', fontSize: 16, textAlign: 'center' },
});
