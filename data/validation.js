import {ObjectId} from 'mongodb';
import pkg from 'validator';
const { isEmail } = pkg;
import { locations } from "../config/mongoCollections.js";
import { users } from "../config/mongoCollections.js";

const exportedMethods = {
  checkId(id, varName) {
    if (!id) throw `Error: You must provide a ${varName} to search for`;
    if (typeof id !== 'string') throw `Error: ${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: invalid ${varName}`;
    return id;
  },
  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
        throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    return strVal;
  },

  checkNumber(numVal, varName) {
    if (numVal === undefined || numVal === null) throw `Error: You must supply a ${varName}.`;
    if (typeof numVal === 'string') {
      numVal = Number(numVal);
    }
    if (isNaN(numVal)) throw `Error: ${varName} must be a number.`;
    if (numVal < 0) throw `Error: ${varName} cannot be negative.`;
    return numVal;
  },
  checkEmail(emailVal, varName){
    emailVal = this.checkString(emailVal);
    if (!isEmail(emailVal)) throw `Error: ${varName} must be a valid email address.`;
    return emailVal;
  },
  async locationExists(locationId){
    const locationCollection = await locations();
    if(!(await locationCollection.find({ _id: new ObjectId(locationId)}))){
      throw `Error: Location with ID ${locationId} does not exist`;
    }
    return locationId;
  },
  async userExists(userId){
    const userCollection = await users();
    if(!(await userCollection.find({ _id: new ObjectId(userId)}))){
       throw `Error: Location with ID ${userId} does not exist`;
    }
    return userId;
  },
  isLetter(c){
    return ((c.charCodeAt(0) >= 65 && c.charCodeAt(0) <= 90) || (c.charCodeAt(0) >= 97 && c.charCodeAt(0) <= 122));
  },
  isAccented(c){
    return (c.charCodeAt(0) >= 128 && c.charCodeAt(0) <= 165)
  },
  checkName(name, varName){
    if(name.length < 2 || name.length > 50){
      throw `Error: Invalid ${varName} length`
    }
    for(let c of name){
      if(!(this.isLetter(c) || this.isAccented(c) || c === "'" || c === "-" || c.charCodeAt(0)===32 || c===".")){
        throw `Error: Invalid character in ${varName}`
      }
    }
    if(!(this.isLetter(name[0]) || this.isAccented(name[0]))){
      throw `Error: ${varName} must start with a letter or accented letter`
    }
    return name;
  }
};

export default exportedMethods;