import { supabase } from '../config/supabase';

export interface NewsStory {
  id?: string;
  title: string;
  summary: string;
  original_url: string;
  image_url: string;
  source_id?: string; // We'll look this up or pass it in later
  category_id?: string;
  author: string;
  published_at: string; // ISO date string
}

/**
 * Fetches the latest active news stories from the database, grouped/filtered.
 */
export async function getLatestNews(limit: number = 20, offset: number = 0) {
  const { data, error } = await supabase
    .from('news_stories')
    .select(`
      id, title, summary, original_url, image_url, author, published_at, view_count,
      sources ( name, logo_url ),
      categories ( name, slug )
    `)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching latest news:', error);
    throw error;
  }

  return data;
}

/**
 * Inserts a new news story into the database.
 * The original_url property is used to prevent duplicate insertions (if unique constraint exists).
 */
export async function insertNewsStory(story: NewsStory) {
  // If we don't have a source_id or category_id, we might need to default them or handle the nulls
  const { data, error } = await supabase
    .from('news_stories')
    .insert([
      {
        title: story.title,
        summary: story.summary,
        original_url: story.original_url,
        image_url: story.image_url,
        author: story.author,
        published_at: story.published_at,
      }
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
       // Unique violation (e.g., duplicate original_url)
       console.log(`Story already exists: ${story.original_url}`);
       return null;
    }
    console.error('Error inserting news story:', error);
    throw error;
  }

  return data;
}

/**
 * Keeps the newest `keepCount` stories in the database and automatically deletes the rest.
 */
export async function purgeOldNews(keepCount: number = 100) {
  try {
    // Find the published_at boundary of the `keepCount`-th newest article
    const { data: thresholdData, error: fetchError } = await supabase
      .from('news_stories')
      .select('published_at')
      .order('published_at', { ascending: false })
      .range(keepCount - 1, keepCount - 1)
      .limit(1);

    if (fetchError) throw fetchError;

    // If we have fewer than `keepCount` articles, do nothing
    if (!thresholdData || thresholdData.length === 0) {
      return null;
    }

    const thresholdDate = thresholdData[0].published_at;

    // Delete everything strictly older than the threshold date
    const { data, error: deleteError } = await supabase
      .from('news_stories')
      .delete()
      .lt('published_at', thresholdDate);

    if (deleteError) throw deleteError;
    
    return data;
  } catch (err: any) {
    console.error('❌ Error purging old news:', err.message);
    throw err;
  }
}
