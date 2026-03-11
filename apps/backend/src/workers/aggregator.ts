import axios from 'axios';
import { summarizeArticle } from '../services/geminiService';
import { purgeOldNews } from '../services/newsService';
import { supabase } from '../config/supabase';

// Map our queries to our database category slugs
const QUERIES = [
  { term: '"Artificial Intelligence" OR "Machine Learning"', categorySlug: 'ai-models' },
  { term: '"Robotics" OR "Humanoid Robot"', categorySlug: 'robotics-research' }
];

export async function runAggregatorJob() {
  console.log('🔄 Starting automated news aggregation job...');

  const API_KEY = process.env.GNEWS_API_KEY;
  if (!API_KEY) {
    console.error('❌ Missing GNEWS_API_KEY in environment variables.');
    return;
  }

  try {
    // 1. Fetch category IDs from database
    const { data: categories, error: catError } = await supabase.from('categories').select('id, slug');
    if (catError || !categories) throw new Error('Failed to fetch categories from DB');

    for (const query of QUERIES) {
      console.log(`📡 Fetching latest news for: ${query.term} from GNews...`);
      
      const categoryId = categories.find(c => c.slug === query.categorySlug)?.id;
      if (!categoryId) {
         console.warn(`⚠️ Category ID not found for slug: ${query.categorySlug}`);
         continue;
      }

      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query.term)}&lang=en&max=5&apikey=${API_KEY}`;
      const response = await axios.get(url);
      const articles = response.data.articles || [];

      console.log(`📥 Found ${articles.length} articles for ${query.term}`);

      for (const article of articles) {
        console.log(`🧠 Summarizing: ${article.title}`);
        
        try {
          // 2. Summarize via Gemini (strictly 60 words)
          const summary = await summarizeArticle(article.title, article.description || article.content);

          // 3. Save to Supabase Database
          console.log(`💾 Saving "${article.title}" to database...`);
          
          const { error: insertError } = await supabase
            .from('news_stories')
            .insert([{
              title: article.title,
              summary: summary,
              original_url: article.url,
              image_url: article.image,
              author: article.source.name,
              category_id: categoryId,
              published_at: article.publishedAt
            }]);

          if (insertError) {
            if (insertError.code === '23505') {
              console.log('ℹ️ Story already existed in database (Skipped).');
            } else {
              console.error('❌ Insert failed:', insertError.message);
            }
          } else {
            console.log('✅ Successfully inserted new article.');
          }
        } catch (sumErr: any) {
          console.error(`❌ Failed processing article "${article.title}":`, sumErr.message);
        }
      }
    }
    
    // 4. Clean up old memory-hogging articles (Keep the 100 newest)
    console.log('🧹 Purging old news (keeping latest 100)...');
    await purgeOldNews(100);

    console.log('🎉 Hourly aggregation job complete!');
  } catch (err: any) {
    console.error('❌ Aggregation job failed:', err.message);
  }
}

// If run directly via node, execute the job
if (require.main === module) {
  runAggregatorJob().then(() => process.exit(0));
}
