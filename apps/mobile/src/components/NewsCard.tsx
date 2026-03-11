import { StyleSheet, View, Text, ImageBackground, Dimensions, TouchableOpacity, Platform, Share, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bookmark, Share2, ChevronUp, ExternalLink, Cpu } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { useNewsStore, NewsArticle } from '../store/useNewsStore';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height;

interface NewsCardProps {
  article: NewsArticle;
  isActive: boolean;
  cardHeight?: number;
}

export default function NewsCard({ article, isActive, cardHeight }: NewsCardProps) {
  const { bookmarks, toggleBookmark } = useNewsStore();
  const isBookmarked = bookmarks.some(b => b.id === article.id);

  const openArticle = async () => {
    if (article.url) {
      try {
        await WebBrowser.openBrowserAsync(article.url, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
          controlsColor: '#0ea5e9',
          toolbarColor: '#000000',
        });
      } catch (e) {
        console.error('Error opening URL: ', e);
      }
    }
  };

  const handleShare = async () => {
    try {
      if (article.url) {
        await Share.share({
          message: `Check out this article: ${article.title}\n\n${article.url}`,
          url: article.url,
          title: article.title,
        });
      }
    } catch (error: any) {
      console.error('Error sharing:', error.message);
    }
  };

  return (
    <View style={[styles.container, { height: cardHeight || CARD_HEIGHT }]}>
      <ImageBackground
        source={{ uri: article.imageUrl }}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,1)']}
          locations={[0, 0.2, 0.5, 1]}
          style={styles.gradient}
        >
          {isActive ? (
            <TouchableOpacity 
              style={styles.contentContainer} 
              onPress={openArticle} 
              activeOpacity={0.9}
            >
              {/* Top Tags - Cyberpunk Style */}
              <View style={styles.tagRow}>
                <View style={styles.cyberBadge}>
                  <View style={{ marginRight: 6 }}>
                    <Cpu color="#0ea5e9" size={14} />
                  </View>
                  <Text style={styles.cyberText}>SYS.{article.category.replace(/\s+/g, '_').toUpperCase()}</Text>
                </View>
                <View style={[styles.cyberBadge, { borderColor: '#52525b', backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <Text style={[styles.cyberText, { color: '#a1a1aa' }]}>T-{article.time}</Text>
                </View>
              </View>

              {/* Title & Summary */}
              <View style={styles.textBlock}>
                <View style={styles.cyberAccentLine} />
                <View>
                  <Text style={styles.title} numberOfLines={4}>
                    {article.title}
                  </Text>
                  <Text style={styles.summary}>
                    {article.summary}
                  </Text>
                </View>
              </View>

              {/* Bottom Actions */}
              <View style={styles.footer}>
                <View style={styles.sourceInfo}>
                  <ExternalLink color="#0ea5e9" size={16} />
                  <Text style={styles.sourceText}>
                    SRC_LINK: <Text style={styles.authorText}>{article.source.toUpperCase()}</Text>
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                    <Share2 color="#0ea5e9" size={22} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.iconButton, isBookmarked && styles.iconButtonActive]}
                    onPress={() => toggleBookmark(article)}
                  >
                    <Bookmark 
                      color={isBookmarked ? '#000' : '#0ea5e9'} 
                      fill={isBookmarked ? '#0ea5e9' : 'transparent'} 
                      size={20} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Swipe Up Indicator */}
              <View style={styles.swipeIndicator}>
                <ChevronUp color="#0ea5e9" size={24} />
                <Text style={styles.swipeText}>NEXT_DATA_PACKET</Text>
              </View>

            </TouchableOpacity>
          ) : (
            <View style={styles.contentContainer} />
          )}
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: CARD_HEIGHT,
    backgroundColor: '#000',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
    zIndex: 2,
  },
  contentContainer: {
    justifyContent: 'flex-end',
    paddingTop: 60,
    zIndex: 10,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cyberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderColor: '#0ea5e9',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    borderLeftWidth: 4,
  },
  cyberText: {
    color: '#0ea5e9',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  textBlock: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  cyberAccentLine: {
    width: 3,
    backgroundColor: '#0ea5e9',
    marginRight: 16,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    width: width - 60,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  summary: {
    color: '#e4e4e7',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    width: width - 60,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    borderStyle: 'dashed',
    paddingTop: 20,
    marginBottom: 20,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    color: '#0ea5e9',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  authorText: {
    color: '#ffffff',
  },
  actionRow: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#27272a',
    borderWidth: 1,
  },
  iconButtonActive: {
    borderColor: '#0ea5e9',
    backgroundColor: '#0ea5e9',
  },
  swipeIndicator: {
    alignItems: 'center',
    marginTop: 10,
    opacity: 0.6,
  },
  swipeText: {
    color: '#0ea5e9',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  }
});
