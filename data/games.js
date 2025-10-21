import { games } from "../config/mongoCollections";
import validation from './validation.js';

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
  }
  
};

export default exportedMethods;