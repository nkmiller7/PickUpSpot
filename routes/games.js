import { Router } from "express";
import { gameData, userData, locationData } from "../data/index.js";
import validation from "../data/validation.js";
import { ObjectId } from "mongodb";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const gameList = await gameData.getAllGames();
    res.json(gameList);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const game = await gameData.getGameById(id);
    res.json(game);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const gameList = await gameData.getGamesByUserId(id);
    res.json(gameList);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

router.get("/locations/:id", async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    let gameList = await gameData.getGamesByLocationId(id);
    const location = await locationData.getLocationById(id);

    /*
     * Need to add additional fields to gameList for rendering
     * game single location page.
     */
    for (let i = 0; i < gameList.length; ++i) {
      const gameCreator = await userData.getUserById(
        gameList[i].userId.toString()
      );
      gameList[i].creatorFirstName = "Anonymous";
      gameList[i].creatorLastName = "User";
      gameList[i].hasJoined = false;
      gameList[i].isCreator = false;
      if (gameCreator.isAnonymous === false) {
        gameList[i].creatorFirstName = gameCreator.firstName;
        gameList[i].creatorLastName = gameCreator.lastName;
      }
      if (
        gameList[i].registeredPlayers
          .map((Obj) => {
            return Obj.toString();
          })
          .includes(req.session.user.userId)
      ) {
        gameList[i].hasJoined = true;
      }
      if (gameList[i].userId.toString() === req.session.user.userId) {
        gameList[i].isCreator = true;
      }
    }

    res.render("games/index", {
      isGamesPage: true,
      games: gameList,
      location: location,
      user: req.session.user,
    });
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

router.get("/join/:id", async (req, res) => {
  // This shouldn't be a post, but I'm lazy and we don't have ajax setup yet...
  try {
    const gameId = validation.checkId(req.params.id, "Game ID");
    const userId = validation.checkId(req.session.user.userId, "User ID");
    const updatedGame = await gameData.addUserToGame(gameId, userId);
    res.json(updatedGame);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

export default router;
