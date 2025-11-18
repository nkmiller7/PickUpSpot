import {Router} from 'express';

const router = Router();

router.get('/', async (req, res) => {
  try {
    return res.render('about/index', { user: req.session.user });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

export default router;