import { games } from "../config/mongoCollections.js";
import validation from "./validation.js";
import { ObjectId } from "mongodb";
import { locationData } from "../data/index.js";

const exportedMethods = {
  async getAllGames() {
    const gameCollection = await games();
    const gameList = await gameCollection.find({}).toArray();
    return gameList;
  },

  async getGameById(id) {
    id = validation.checkId(id, "Game ID");
    const gameCollection = await games();
    const game = await gameCollection.findOne({ _id: new ObjectId(id) });
    if (!game) throw "Error: Game not found";
    return game;
  },

  async getGamesByLocationId(locationId) {
    locationId = validation.checkId(locationId, "Location ID");
    locationId = await validation.locationExists(locationId);
    const gameCollection = await games();
    const gameList = await gameCollection
      .find({ locationId: new ObjectId(locationId) })
      .toArray();
    return gameList;
  },

  async getGamesByUserId(userId) {
    userId = validation.checkId(userId, "User ID");
    userId = await validation.userExists(userId);
    const gameCollection = await games();
    const gameList = await gameCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();
    return gameList;
  },

  async getGamesByUserIdParticipant(userId) {
    userId = validation.checkId(userId, "User ID");
    userId = await validation.userExists(userId);
    const gameCollection = await games();
    const gameList = await gameCollection
      .find({ registeredPlayers: new ObjectId(userId) })
      .toArray();
    return gameList;
  },

  async removeRegisteredPlayerFromGame(gameId, userId) {
    gameId = validation.checkId(gameId, "Game ID");
    userId = validation.checkId(userId, "User ID");

    const gameCollection = await games();
    const game = await gameCollection.findOne({ _id: new ObjectId(gameId) });

    if (!game) throw `Error: Game with ID ${gameId} not found`;

    const updatedPlayers = game.registeredPlayers.filter(
      (playerId) => playerId.toString() !== userId
    );

    if (updatedPlayers.length === game.registeredPlayers.length)
      throw "Error: User with ID not found in registered players";

    const updateInfo = await gameCollection.updateOne(
      { _id: new ObjectId(gameId) },
      { $set: { registeredPlayers: updatedPlayers } }
    );

    const updatedGame = await gameCollection.findOne({
      _id: new ObjectId(gameId),
    });
    return updatedGame;
  },

  async addGame(
    userId,
    locationId,
    startTime,
    endTime,
    sport,
    numOfPlayers,
    courtNumber,
    skillLevel
  ) {
    userId = validation.checkId(userId, "User ID");
    userId = await validation.userExists(userId);
    locationId = validation.checkId(locationId, "Location ID");
    locationId = await validation.locationExists(locationId);

    startTime = validation.checkISO8601String(startTime, "Start Time");
    endTime = validation.checkISO8601String(endTime, "End Time");
    startTime = new Date(startTime);
    endTime = new Date(endTime);

    sport = validation.checkSport(sport, "Sport");
    courtNumber = validation.checkNumber(courtNumber, "Court Number");
    skillLevel = validation.checkSkillLevel(skillLevel, "Skill Level");

    if (endTime <= startTime) throw "Error: End time must be after start time";
    if ((endTime - startTime) / (1000 * 60) > 180)
      throw "Error: Game duration cannot exceed 3 hours";

    const location = await locationData.getLocationById(locationId);
    if (sport === "tennis" || sport === "pickleball") {
      if (!location.facilities.tennis) {
        throw "Error: No tennis courts at this location.";
      }
      if (courtNumber > location.facilities.tennis.numCourts) {
        throw "Error: Court number doesn't exist.";
      }
    }
    if (sport === "basketball") {
      if (!location.facilities.basketball) {
        throw "Error: No basketball courts at this location.";
      }
      if (courtNumber > location.facilities.basketball.numCourts) {
        throw "Error: Court number doesn't exist.";
      }
    }

    numOfPlayers = validation.checkNumber(numOfPlayers, "Number of Players");
    if (numOfPlayers < 1) {
      throw "Error: Must have at least one player";
    }
    if (sport === "tennis") {
      if (numOfPlayers > 8) {
        throw "Error: Too many players for tennis";
      }
    }
    if (sport === "basketball") {
      if (numOfPlayers > 20) {
        throw "Error: Too many players for basketball";
      }
    }

    const newGame = {
      userId: new ObjectId(userId),
      locationId: new ObjectId(locationId),
      sport: sport,
      startTime: startTime,
      endTime: endTime,
      desiredParticipants: numOfPlayers,
      courtNumber: courtNumber,
      skillLevel: skillLevel,
      registeredPlayers: [new ObjectId(userId)],
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const gameCollection = await games();
    const insertInfo = await gameCollection.insertOne(newGame);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw "Error: Could not add game";

    const newId = insertInfo.insertedId.toString();
    const game = await this.getGameById(newId);
    return game;
  },

  async addUserToGame(gameId, userId) {
    // Validation
    gameId = validation.checkId(gameId, "Game ID");
    userId = validation.checkId(userId, "User ID");
    userId = await validation.userExists(userId);
    gameId = await validation.gameExists(gameId);

    let gameToJoin = await this.getGameById(gameId);

    // Check if user is already registered
    for (let registeredUserId of gameToJoin.registeredPlayers) {
      if (registeredUserId.toString() === userId) {
        throw "Error: User is already registered for this game";
      }
    }

    // Check if there is space available
    if (gameToJoin.registeredPlayers.length >= gameToJoin.desiredParticipants) {
      throw "Error: Game is already full";
    }

    // Ensure game date is valid (assuming 24 hour time so need to convert db to 24 hour time everywhere)
    let currentlyJoinedGames = await this.getGamesByUserIdParticipant(userId);
    for (let i = 0; i < currentlyJoinedGames.length; ++i) {
      if (
        validation.timeConflictExist(
          gameToJoin.startTime,
          gameToJoin.endTime,
          currentlyJoinedGames[i].startTime,
          currentlyJoinedGames[i].endTime
        )
      ) {
        throw "Error: User has a scheduled conflict";
      }
    }

    gameToJoin.registeredPlayers.push(new ObjectId(userId));
    gameToJoin.updatedAt = new Date();
    const gameCollection = await games();
    const updatedGame = await gameCollection.findOneAndReplace(
      { _id: new ObjectId(gameId) },
      gameToJoin,
      { returnDocument: "after" }
    );
    return updatedGame;
  },

  async deleteGame(gameId, userId) {
    // Validation
    gameId = validation.checkId(gameId, "Game ID");
    userId = validation.checkId(userId, "User ID");
    gameId = await validation.gameExists(gameId);
    userId = await validation.userExists(userId);

    const gameToDelete = await this.getGameById(gameId);

    // Ensure the user trying to delete the game is the creator
    if (gameToDelete.userId.toString() !== userId) {
      throw "Error: User is not the creator of the game";
    }

    const gameCollection = await games();
    const result = await gameCollection.deleteOne({
      _id: new ObjectId(gameId),
    });
    if (result.deletedCount !== 1) {
      throw "Error: Failed to delete the game";
    }
  },
};

export default exportedMethods;
