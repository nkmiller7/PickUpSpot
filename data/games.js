import { games } from "../config/mongoCollections.js";
import validation from './validation.js';
import { ObjectId } from 'mongodb';

const exportedMethods = {
  async getAllGames() {
    const gameCollection = await games();
    const gameList = await gameCollection.find({}).toArray();
    return gameList;
  },

  async getGameById(id) {
    id = validation.checkId(id);
    const gameCollection = await games();
    const game = await gameCollection.findOne({ _id: new ObjectId(id) });
    if (!game) throw 'Error: Game not found';
    return game;
  },

  async getGamesByCourtId(courtId) {
    courtId = validation.checkId(courtId);
    const gameCollection = await games();
    const gameList = await gameCollection.find({ courtId: courtId }).toArray();
    return gameList;
  },
  
  async getGamesByUserId(userId) {
    userId = validation.checkId(userId);
    const gameCollection = await games();
    const gameList = await gameCollection.find({ userId: userId }).toArray();
    return gameList;
  },

  async addGame(userId, courtId, date, startTime, endTime, numOfPlayers) {
    userId = validation.checkId(userId);
    courtId = validation.checkId(courtId);
    
    if (!date || typeof date !== 'string') throw 'Error: Date must be provided as a string';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) throw 'Error: Invalid date format';
    if (dateObj < new Date()) throw 'Error: Game date must be in the future';

    // Validate start and end times (HH:MM format)
    if (!startTime || typeof startTime !== 'string') throw 'Error: Start time must be provided as a string';
    if (!endTime || typeof endTime !== 'string') throw 'Error: End time must be provided as a string';
    
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime)) throw 'Error: Start time must be in HH:MM format';
    if (!timeRegex.test(endTime)) throw 'Error: End time must be in HH:MM format';

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      throw 'Error: End time must be after start time';
    }

    if (endMinutes - startMinutes > 180) {
      throw 'Error: Game duration cannot exceed 3 hours';
    }

    const newGame = {
      userId: new ObjectId(userId),
      courtId: new ObjectId(courtId),
      date: dateObj,
      startTime: startTime,
      endTime: endTime,
      maxPlayers: numOfPlayers,
      currentPlayers: [new ObjectId(userId)], 
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const gameCollection = await games();
    const insertInfo = await gameCollection.insertOne(newGame);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw 'Error: Could not add game';
    }

    const newId = insertInfo.insertedId.toString();
    const game = await this.getGameById(newId);
    return game;
  }
};

export default exportedMethods;