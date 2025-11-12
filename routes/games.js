import {Router} from 'express';
import { gameData, userData, locationData } from '../data/index.js';
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
    const location = await locationData.getLocationById(id);

    /* 
     * Need to add additional fields to gameList for rendering 
     * game single location page.
     */
    for (let i = 0; i < gameList.length; ++i) {
      const gameCreator = await userData.getUserById(gameList[i].userId);
      gameList[i].creatorFirstName = "Anonymous";
      gameList[i].creatorLastName = "User";
      if (gameCreator.isAnonymous === false) {
        gameList[i].creatorFirstName = gameCreator.firstName;
        gameList[i].creatorLastName = gameCreator.lastName;
      }
    }

    res.render("games/index", { isGamesPage: true, games: gameList, location: location });
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

export default router;

