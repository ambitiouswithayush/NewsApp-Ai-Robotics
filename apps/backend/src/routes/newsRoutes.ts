import { Router, Request, Response } from 'express';
import { getLatestNews } from '../services/newsService';

const router = Router();

// GET /api/news - Fetch latest summary cards
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const news = await getLatestNews(limit, offset);
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch news' });
  }
});

export default router;
