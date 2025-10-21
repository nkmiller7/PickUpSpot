import {Router} from 'express';
import { gameData } from '../data/index.js';
import validation from '../data/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const gameList = await gameData.getAllGames();
    res.json(gameList);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const game = await gameData.getGameById(id);
    res.json(game);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const gameList = await gameData.getGamesByUserId(id);
    res.json(gameList);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

router.get('/locations/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const gameList = await gameData.getGamesByLocationId(id);
    res.json(gameList);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

export default router;

