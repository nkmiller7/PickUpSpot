import {Router} from 'express';

const router = Router();

router.get('/', async (req, res) => {
  try {
    res.render('about/index');
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

export default router;