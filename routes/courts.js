import {Router} from 'express';
import { courtData } from '../data/index.js';
import validation from '../data/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const courtList = await courtData.getAllCourts();
    res.render('courts/index', { courts: courtList });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const court = await courtData.getCourtById(id);
    res.render('courts/single', { court: court });
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

export default router;

