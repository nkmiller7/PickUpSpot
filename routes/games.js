import { Router } from "express";
import { gameData, userData, locationData } from "../data/index.js";
import validation from "../data/validation.js";

const router = Router();

router.get("/:id", async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const game = await gameData.getGameById(id);

    /* Initialize game fields for rendering. */
    const gameCreator = await userData.getUserById(game.userId.toString());
    game.creatorFirstName = "Anonymous";
    game.creatorLastName = "User";
    if (gameCreator.isAnonymous === false) {
      game.creatorFirstName = gameCreator.firstName;
      game.creatorLastName = gameCreator.lastName;
    }
    game.date = game.startTime.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    game.startTimeFmt = game.startTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    game.endTimeFmt = game.endTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const gameLocation = await locationData.getLocationById(
      game.locationId.toString()
    );
    game.locationName = gameLocation.name;

    game.numRegisteredPlayers = game.registeredPlayers.length;
    game.registeredPlayersNames = [];
    for (let i = 0; i < game.numRegisteredPlayers; ++i) {
      const curUser = await userData.getUserById(
        game.registeredPlayers[i].toString()
      );
      game.registeredPlayersNames[i] = "Anonymous User";
      if (curUser.isAnonymous === false) {
        game.registeredPlayersNames[
          i
        ] = `${curUser.firstName} ${curUser.lastName}`;
      }
    }

    res.render("games/single", {
      isGameDetailsPage: true,
      isUserGameCreator:
        req.session.user.userId.toString() === game.userId.toString(),
      game: game,
      user: req.session.user,
    });
  } catch (e) {
    res.status(404).render("errors/404", {error: e.toString() });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    let gameId = validation.checkId(req.params.id, "Game ID");
    let userId = validation.checkId(req.session.user.userId.toString(), "User ID");
    gameId = await validation.gameExists(gameId);
    userId = await validation.userExists(userId);

    const skillLevel = validation.checkSkillLevel(
      req.body.skillLevel,
      "Skill Level"
    );
    const desiredParticipants = validation.checkNumber(
      req.body.desiredParticipants,
      "Desired Participants"
    );

    const result = await gameData.updateGame(gameId, userId, desiredParticipants, skillLevel);
    res.json(result);
  } catch (e) {
    res.status(404).render("errors/404", {error: e.toString() });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let gameId = validation.checkId(req.params.id, "Game ID");
    let userId = validation.checkId(req.session.user.userId.toString(), "User ID");
    gameId = await validation.gameExists(gameId);
    userId = await validation.userExists(userId);

    await gameData.deleteGame(gameId, userId);

    res.json({ message: "Game deleted." });
  } catch (e) {
    res.status(404).render("errors/404", {error: e.toString() });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const gameList = await gameData.getGamesByUserId(id);
    res.json(gameList);
  } catch (e) {
    res.status(404).render("errors/404", {error: e.toString() });
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
      gameList[i].date = gameList[i].startTime.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      gameList[i].startTimeFmt = gameList[i].startTime.toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
      gameList[i].endTimeFmt = gameList[i].endTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    /*
     * Scheduling grid needs the times of the park's operation.
     */
    let openingTime = new Date(
      2000,
      1,
      1,
      location.openingTime.split(":")[0],
      location.openingTime.split(":")[1]
    );
    let closingTime = new Date(
      2000,
      1,
      1,
      location.closingTime.split(":")[0],
      location.closingTime.split(":")[1]
    );
    let schedulingTimeBlocks = [];
    while (openingTime < closingTime) {
      schedulingTimeBlocks.push(openingTime);
      openingTime = new Date(openingTime.getTime() + 60 * 60000);
    }
    location.schedulingTimeBlocks = JSON.stringify(schedulingTimeBlocks);

    /*
     * Scheduling grid also needs the following 7 days (starting from tomorrow's date).
     */
    let schedulingDateBlocks = [];
    for (let i = 1; i <= 7; ++i) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + i);
      schedulingDateBlocks.push(date);
    }
    location.schedulingDateBlocks = JSON.stringify(schedulingDateBlocks);

    res.render("games/index", {
      isGamesPage: true,
      games: gameList,
      location: location,
      user: req.session.user,
    });
  } catch (e) {
    res.status(404).render("errors/404", {error: e.toString() });
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
    const sport = validation.checkSport(req.body.sport, "Sport");
    const startTime = validation.checkISO8601String(
      req.body.startTime,
      "Start Time"
    );
    const endTime = validation.checkISO8601String(req.body.endTime, "End Time");
    // console.log(startTime, endTime);
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
      startTime,
      endTime,
      sport,
      desiredParticipants,
      courtNumber,
      skillLevel
    );
    // console.log(createdGame);
    res.json(createdGame);
  } catch (e) {
    // console.log(e); 
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
    res.status(404).render("errors/404", {error: e.toString() });
  }
});

export default router;
