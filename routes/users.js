import {Router} from 'express';
import { userData } from '../data/index.js';
import validation from '../data/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const userList = await userData.getAllUsers();
    res.json(userList);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const user = await userData.getUserById(id);
    res.json(user);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

export default router;