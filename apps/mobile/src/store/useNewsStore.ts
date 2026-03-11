import { create } from 'zustand';
import { supabase } from '../api/supabase';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  source: string;
  author: string;
  imageUrl: string;
  url: string;
  time: string;
  published_at: string;
}

interface NewsState {
  feed: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  activeCategory: 'AI' | 'Robotics';
  searchResults: NewsArticle[];
  isSearching: boolean;
  bookmarks: NewsArticle[];
  setActiveCategory: (category: 'AI' | 'Robotics') => void;
  fetchNews: (reset?: boolean) => Promise<void>;
  searchNews: (query: string) => Promise<void>;
  clearSearch: () => void;
  toggleBookmark: (article: NewsArticle) => void;
}

const PAGE_SIZE = 10;

const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'mock-1',
    title: 'OpenAI announces massive breakthrough in multi-modal reasoning models',
    summary: 'The new model architecture dramatically reduces hallucination rates while processing text, audio, and high-framerate video simultaneously. Early benchmarks suggest a 45% improvement in zero-shot logical reasoning tasks compared to previous top-tier enterprise AI models.',
    category: 'AI Models',
    source: 'TechCrunch',
    author: 'Sarah Perez',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1080',
    url: 'https://techcrunch.com',
    time: '2h ago',
    published_at: new Date().toISOString()
  },
  {
    id: 'mock-2',
    title: 'Boston Dynamics unveils fully autonomous humanoid for warehouse logistics',
    summary: 'Atlas has been completely redesigned with electric actuators, shedding its hydraulics. The new robot can self-correct its balance, carry 50kg payloads, and map complex dynamic environments in real-time using localized visual-slam AI clusters.',
    category: 'Robotics',
    source: 'The Verge',
    author: 'Tom Warren',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1080',
    url: 'https://theverge.com',
    time: '5h ago',
    published_at: new Date().toISOString()
  },
  {
    id: 'mock-3',
    title: 'Anthropic raises Series D, valuing the AI safety startup at $18 Billion',
    summary: 'The fundraising round was heavily oversubscribed, with major tech conglomerates increasing their stake. The funds will strictly be used to acquire exa-scale computing clusters to refine their Constitutional AI safeguards before the next model generation drops.',
    category: 'Funding',
    source: 'Bloomberg',
    author: 'Ed Ludlow',
    imageUrl: 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?auto=format&fit=crop&q=80&w=1080',
    url: 'https://bloomberg.com',
    time: '8h ago',
    published_at: new Date().toISOString()
  }
];

export const useNewsStore = create<NewsState>((set, get) => ({
  feed: [],
  isLoading: false,
  error: null,
  page: 0,
  hasMore: true,
  activeCategory: 'AI',
  searchResults: [],
  isSearching: false,
  bookmarks: [],

  clearSearch: () => set({ searchResults: [], isSearching: false }),

  toggleBookmark: (article: NewsArticle) => {
    const { bookmarks } = get();
    const exists = bookmarks.some(b => b.id === article.id);
    if (exists) {
      set({ bookmarks: bookmarks.filter(b => b.id !== article.id) });
    } else {
      set({ bookmarks: [...bookmarks, article] });
    }
  },

  searchNews: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }
    set({ isSearching: true });
    
    try {
      const { data, error } = await supabase
        .from('news_stories')
        .select(`
          id, title, summary, image_url, original_url, author, published_at,
          sources ( name ),
          categories!inner ( name )
        `)
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!data) {
        set({ searchResults: [], isSearching: false });
        return;
      }

      const formattedData = data.map((item: any) => {
        const sourceName = item.sources ? (Array.isArray(item.sources) ? item.sources[0]?.name : item.sources.name) : 'AI News';
        const catName = item.categories ? (Array.isArray(item.categories) ? item.categories[0]?.name : item.categories.name) : 'Tech';
        return {
          id: item.id,
          title: item.title,
          summary: item.summary,
          imageUrl: item.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1080',
          url: item.original_url || 'https://google.com',
          author: item.author || 'Unknown',
          source: sourceName,
          category: catName,
          time: new Date(item.published_at).toLocaleDateString(),
          published_at: item.published_at
        };
      });

      set({ searchResults: formattedData, isSearching: false });
    } catch (err: any) {
      console.error('Error searching news:', err);
      set({ searchResults: [], isSearching: false });
    }
  },

  setActiveCategory: (category) => {
    set({ activeCategory: category, feed: [], page: 0, hasMore: true });
    get().fetchNews(true);
  },

  fetchNews: async (reset = false) => {
    const { page, feed, isLoading, hasMore, activeCategory } = get();
    
    if (isLoading || (!hasMore && !reset)) return;

    set({ isLoading: true, error: null });
    
    const currentPage = reset ? 0 : page;
    const offset = currentPage * PAGE_SIZE;

    try {
      let query = supabase
        .from('news_stories')
        .select(`
          id, title, summary, image_url, original_url, author, published_at,
          sources ( name ),
          categories!inner ( name )
        `)
        .order('published_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (activeCategory === 'Robotics') {
        query = query.ilike('categories.name', '%Robotic%');
      } else {
        query = query.ilike('categories.name', '%AI%');
      }

      const { data, error } = await query;

      if (error) throw error;

      let formattedData: NewsArticle[] = [];

      if (!data || data.length === 0) {
        // Fallback to mock data if the database is empty so the user can always see the UI
        const mockFiltered = activeCategory === 'Robotics' ? MOCK_NEWS.filter(n => n.category === 'Robotics') : MOCK_NEWS.filter(n => n.category !== 'Robotics');
        formattedData = reset ? mockFiltered : [];
      } else {
        formattedData = data.map((item: any) => {
          const sourceName = item.sources ? (Array.isArray(item.sources) ? item.sources[0]?.name : item.sources.name) : 'AI News';
          const catName = item.categories ? (Array.isArray(item.categories) ? item.categories[0]?.name : item.categories.name) : 'Tech';

          return {
            id: item.id,
            title: item.title,
            summary: item.summary,
            imageUrl: item.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1080',
            url: item.original_url || 'https://google.com',
            author: item.author || 'Unknown',
            source: sourceName,
            category: catName,
            time: new Date(item.published_at).toLocaleDateString(),
            published_at: item.published_at
          };
        });
      }

      set({
        feed: reset ? formattedData : [...feed, ...formattedData],
        page: currentPage + 1,
        hasMore: data && data.length === PAGE_SIZE,
        isLoading: false
      });

    } catch (err: any) {
      console.error('Error fetching news:', err);
      // Fallback on error as well
      const mockFiltered = get().activeCategory === 'Robotics' ? MOCK_NEWS.filter(n => n.category === 'Robotics') : MOCK_NEWS.filter(n => n.category !== 'Robotics');
      set({ 
        feed: reset ? mockFiltered : feed, 
        error: err.message, 
        isLoading: false,
        hasMore: false 
      });
    }
  }
}));
