import { ObjectId } from "mongodb";
import pkg from "validator";
const { isEmail } = pkg;
import { locations } from "../config/mongoCollections.js";
import { users, games } from "../config/mongoCollections.js";

const exportedMethods = {
  checkId(id, varName) {
    if (!id) throw `Error: You must provide a ${varName} to search for`;
    if (typeof id !== "string") throw `Error: ${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: invalid ${varName}`;
    return id;
  },
  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    return strVal;
  },
  checkNumber(numVal, varName) {
    if (numVal === undefined || numVal === null)
      throw `Error: You must supply a ${varName}.`;
    if (typeof numVal === "string") {
      numVal = Number(numVal);
    }
    if (isNaN(numVal)) throw `Error: ${varName} must be a number.`;
    if (numVal < 0) throw `Error: ${varName} cannot be negative.`;
    return numVal;
  },
  checkEmail(emailVal, varName) {
    emailVal = this.checkString(emailVal);
    if (!isEmail(emailVal))
      throw `Error: ${varName} must be a valid email address.`;
    return emailVal;
  },
  checkSport(sportVal, varName) {
    sportVal = this.checkString(sportVal, varName).toLowerCase();
    if (
      !(
        sportVal === "basketball" ||
        sportVal === "tennis" ||
        sportVal === "pickleball"
      )
    )
      throw `Error: ${varName} must be a valid sport.`;
    return sportVal;
  },
  checkDate(dateVal, varName) {
    if (!(dateVal instanceof Date))
      throw `Error: ${varName} must be a valid date.`;
    const now = new Date();
    if (dateVal < now) throw `Error: ${varName} cannot be a past date.`;
    return dateVal;
  },
  checkTime(timeVal, varName) {
    timeVal = checkString(timeVal, varName);
    if (!/^([01][0-9]|2[0-3]):([0-5][0-9])$/.test(timeVal))
      throw `Error: ${varName} must be a valid 24 hour time stamp.`;
    return timeVal;
  },
  checkSkillLevel(skillLevelVal, varName) {
    skillLevelVal = checkString(skillLevelVal, varName).toLowerCase();
    if (
      !(
        skillLevelVal === "beginner" ||
        skillLevelVal === "intermediate" ||
        skillLevelVal === "advanced"
      )
    )
      throw `Error: ${varName} must be a valid skill level.`;
    return skillLevelVal;
  },
  async locationExists(locationId) {
    const locationCollection = await locations();
    if (
      !(await locationCollection.findOne({ _id: new ObjectId(locationId) }))
    ) {
      throw `Error: Location with ID ${locationId} does not exist`;
    }
    return locationId;
  },
  async userExists(userId) {
    const userCollection = await users();
    if (!(await userCollection.findOne({ _id: new ObjectId(userId) }))) {
      throw `Error: Location with ID ${userId} does not exist`;
    }
    return userId;
  },
  async gameExists(gameId) {
    const gameCollection = await games();
    if (!(await gameCollection.find({ _id: new ObjectId(gameId) }))) {
      throw `Error: Game with ID ${gameId} does not exist`;
    }
    return gameId;
  },
  timeConflictExist(
    dateA,
    startTimeStampA,
    endTimeStampA,
    dateB,
    startTimeStampB,
    endTimeStampB
  ) {
    if (
      typeof startTimeStampA !== "string" ||
      typeof endTimeStampA !== "string" ||
      typeof startTimeStampB !== "string" ||
      typeof endTimeStampB !== "string"
    ) {
      throw "Error: time stamps must be of type string";
    }

    const startDateA = new Date(dateA);
    startDateA.setHours(startTimeStampA.split(":")[0]);
    startDateA.setMinutes(startTimeStampA.split(":")[1]);

    const endDateA = new Date(dateA);
    endDateA.setHours(endTimeStampA.split(":")[0]);
    endDateA.setMinutes(endTimeStampA.split(":")[1]);

    const startDateB = new Date(dateB);
    startDateB.setHours(startTimeStampB.split(":")[0]);
    startDateB.setMinutes(startTimeStampB.split(":")[1]);

    const endDateB = new Date(dateB);
    endDateB.setHours(endTimeStampB.split(":")[0]);
    endDateB.setMinutes(endTimeStampB.split(":")[1]);

    return (
      (startDateA >= startDateB && startDateA <= endDateB) ||
      (endDateA >= startDateB && endDateA <= endDateB)
    );
  },
  isLetter(c) {
    return (
      (c.charCodeAt(0) >= 65 && c.charCodeAt(0) <= 90) ||
      (c.charCodeAt(0) >= 97 && c.charCodeAt(0) <= 122)
    );
  },
  isAccented(c) {
    return c.charCodeAt(0) >= 128 && c.charCodeAt(0) <= 165;
  },
  checkName(name, varName) {
    if (name.length < 2 || name.length > 50) {
      throw `Error: Invalid ${varName} length`;
    }
    for (let c of name) {
      if (
        !(
          this.isLetter(c) ||
          this.isAccented(c) ||
          c === "'" ||
          c === "-" ||
          c.charCodeAt(0) === 32 ||
          c === "."
        )
      ) {
        throw `Error: Invalid character in ${varName}`;
      }
    }
    if (!(this.isLetter(name[0]) || this.isAccented(name[0]))) {
      throw `Error: ${varName} must start with a letter or accented letter`;
    }
    return name;
  },
};

export default exportedMethods;
