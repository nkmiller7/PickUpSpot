import { Router } from "express";
import { gameData, userData, locationData } from "../data/index.js";
import validation from "../data/validation.js";

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
    const userId = validation.checkId(req.session.user.userId, "User ID");
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
          .includes(userId)
      ) {
        gameList[i].hasJoined = true;
      }
      if (gameList[i].userId.toString() === userId) {
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

router.post("/join", async (req, res) => {
  try {
    const gameId = validation.checkId(req.body.gameId, "Game ID");
    const userId = validation.checkId(req.session.user.userId, "User ID");
    const updatedGame = await gameData.addUserToGame(gameId, userId);
    res.json(updatedGame);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router.post("/create", async (req, res) => {
  try {
    const locationId = validation.checkId(req.body.locationId, "Location ID");
    const userId = validation.checkId(req.session.user.userId, "User ID");
    const gameDate = validation.checkDate(req.body.date, "Game Date");
    const sport = validation.checkSport(req.body.sport, "Sport");
    const startTime = validation.checkTime(req.body.startTime, "Start Time");
    const endTime = validation.checkTime(req.body.endTime, "End Time");
    const desiredParticipants = validation.checkNumber(
      req.body.desiredParticipants,
      "Desired Participants"
    );
    const courtNumber = validation.checkNumber(
      req.body.courtNumber,
      "Court Number"
    );
    const skillLevel = validation.checkSkillLevel(
      req.body.skillLevel,
      "Skill Level"
    );
    const createdGame = await gameData.addGame(
      userId,
      locationId,
      gameDate,
      startTime,
      endTime,
      sport,
      desiredParticipants,
      skillLevel
    );
    res.json(createdGame);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router.post("/leave", async (req, res) => {
  try {
    const gameId = validation.checkId(req.body.gameId, "Game ID");
    const userId = validation.checkId(req.session.user.userId, "User ID");
    const updatedGame = await gameData.removeRegisteredPlayerFromGame(
      gameId,
      userId
    );
    res.status(200).json({ message: "Successfully dropped from game" });
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

export default router;
