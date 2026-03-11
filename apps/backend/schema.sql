-- AI & Robotics News App - Supabase PostgreSQL Schema (15 Tables)
-- Paste this script into the Supabase SQL Editor and click "Run".

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    display_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Pre-populate common categories
INSERT INTO categories (name, slug) 
VALUES 
    ('AI Models', 'ai-models'),
    ('Robotics Research', 'robotics-research'),
    ('Funding & Startups', 'funding-startups'),
    ('Developer Tools', 'developer-tools')
ON CONFLICT (name) DO NOTHING;

-- 3. SOURCES
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    website_url VARCHAR(255),
    logo_url VARCHAR(255),
    reliability_score INT DEFAULT 100
);

-- 4. NEWS_STORIES
CREATE TABLE IF NOT EXISTS news_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL, -- Strict 60 words
    original_content_hash VARCHAR(255),
    original_url VARCHAR(500) UNIQUE NOT NULL, -- To prevent duplicates
    image_url VARCHAR(500),
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    author VARCHAR(100),
    view_count INT DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TAGS
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 6. NEWS_TAGS (Many-to-Many map for news and tags)
CREATE TABLE IF NOT EXISTS news_tags (
    news_id UUID REFERENCES news_stories(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (news_id, tag_id)
);

-- 7. USER_PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, category_id)
);

-- 8. BOOKMARKS
CREATE TABLE IF NOT EXISTS bookmarks (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    news_id UUID REFERENCES news_stories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, news_id)
);

-- 9. NOTIFICATION_TOKENS
CREATE TABLE IF NOT EXISTS notification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_token VARCHAR(255) NOT NULL,
    platform VARCHAR(20) CHECK (platform IN ('ios', 'android', 'web')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TRENDING_METRICS
CREATE TABLE IF NOT EXISTS trending_metrics (
    news_id UUID REFERENCES news_stories(id) ON DELETE CASCADE PRIMARY KEY,
    score INT DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. ADMIN_USERS
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'moderator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. AGGREGATION_LOGS
CREATE TABLE IF NOT EXISTS aggregation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(100) NOT NULL,
    items_fetched INT DEFAULT 0,
    run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) CHECK (status IN ('success', 'failed', 'partial'))
);

-- 13. APP_SETTINGS (System config, toggles)
CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. FEEDBACK (User error reports on summaries)
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    news_id UUID REFERENCES news_stories(id) ON DELETE CASCADE,
    issue_type VARCHAR(50),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE
);

-- 15. USER_SESSIONS (For session tracking beyond basic JWT)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index optimization for fetching the chronological news feed fast
CREATE INDEX IF NOT EXISTS idx_news_stories_published_at_desc ON news_stories(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_stories_category_id ON news_stories(category_id);
