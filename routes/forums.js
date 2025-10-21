import {Router} from 'express';
import { forumData } from '../data/index.js';
import validation from '../data/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const forumList = await forumData.getAllForums();
    res.json(forumList);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const forum = await forumData.getForumById(id);
    res.json(forum);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

export default router;