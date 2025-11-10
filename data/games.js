import { games } from "../config/mongoCollections.js";
import validation from './validation.js';
import { ObjectId } from 'mongodb';
import { locations } from "../config/mongoCollections.js";
import { locationData } from '../data/index.js';

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
    if (!game) throw 'Error: Game not found';
    return game;
  },

  async getGamesByLocationId(locationId) {
    locationId = validation.checkId(locationId, "Location ID");
    locationId = await validation.locationExists(locationId);
    const gameCollection = await games();
    const gameList = await gameCollection.find({ locationId: locationId }).toArray();
    return gameList;
  },
  
  async getGamesByUserId(userId) {
    userId = validation.checkId(userId, "User ID");
    userId = await validation.userExists(userId);
    const gameCollection = await games();
    const gameList = await gameCollection.find({ userId: userId }).toArray();
    return gameList;
  },

  async addGame(userId, locationId, date, startTime, endTime, sport, numOfPlayers, skillLevel) {
    //validate userId and locationId
    userId = validation.checkId(userId, "User ID");
    userId = await validation.userExists(userId);
    locationId = validation.checkId(locationId, "Location ID");
    locationId= await validation.locationExists(locationId);
    date = validation.checkString(date, "Date");

    //Validate dates- needs fixing!
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) throw 'Error: Invalid date format';
    if (dateObj < new Date()) throw 'Error: Game date must be in the future';

    // Validate start and end times (HH:MM format)- needs fixing!
    startTime= validation.checkString(startTime, "Start Time");
    endTime = validation.checkString(endTime, "End Time");
    
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime)) throw 'Error: Start time must be in HH:MM format';
    if (!timeRegex.test(endTime)) throw 'Error: End time must be in HH:MM format';

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) throw 'Error: End time must be after start time';
    if (endMinutes - startMinutes > 180) throw 'Error: Game duration cannot exceed 3 hours';

    //Validate Sport
    sport= validation.checkString(sport, "Sport");
    if(sport.toLowerCase!== "basketball" && sport.toLowerCase !== "tennis"){
      throw 'Error: Sport must be either basketball or tennis';
    }
    locationCollection = await locations();
    const location = await locationData.getLocationById(locationId);
    if(sport==="tennis"){
      if(!location.facilities.tennis){
        throw 'Error: No tennis courts at this location.'
      }
    }
    if(sport==="basketball"){
      if(!location.facilities.basketball){
        throw 'Error: No basketball courts at this location.'
      }
    }


    numOfPlayers = validation.checkNumber(numOfPlayers, "Number of Players");
    if(numOfPlayers < 1){
      throw "Error: Must have at least one player";
    }
    if(sport==="tennis"){
      if(numOfPlayers > 8 * location.facilities.tennis.numCourts){
        throw "Error: Too many players for tennis";
      }
    }
    if(sport==="basketball"){
      if(numOfPlayers > 20 * location.facilities.basketball.numCourts){
        throw "Error: Too many players for basketball";
      }
    }
    skillLevel= validation.checkString(skillLevel, "Skill Level");
    if(skillLevel.toLowerCase() !== "beginner" && skillLevel.toLowerCase() !== "intermediate" && skillLevel.toLowerCase() !== "advanced"){
      throw "Error: Skill leve must be either beginner, intermediate, or advanced"
    }
    const newGame = {
      userId: new ObjectId(userId),
      locationId: new ObjectId(locationId),
      date: dateObj,
      startTime: startTime,
      endTime: endTime,
      desiredParticipants: numOfPlayers,
      registeredPlayers: [new ObjectId(userId)], 
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const gameCollection = await games();
    const insertInfo = await gameCollection.insertOne(newGame);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Error: Could not add game';
 
    const newId = insertInfo.insertedId.toString();
    const game = await this.getGameById(newId);
    return game;
  }
};

export default exportedMethods;