import {Router} from 'express';
import { reviewData } from '../data/index.js';
import validation from '../data/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const reviewList = await reviewData.getAllReviews();
    res.json(reviewList);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const review = await reviewData.getReviewById(id);
    res.json(review);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const reviewList = await reviewData.getReviewsByUserId(id);
    res.json(reviewList);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

router.get('/locations/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const review = await reviewData.getReviewsByLocationId(id);
    res.json(review);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

router.post('/review/:id', async (req, res) => {
  try {
    const reviewData = req.body;
  }
})

export default router;