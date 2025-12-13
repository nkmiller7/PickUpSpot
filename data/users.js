import { users } from "../config/mongoCollections.js";
import validation from './validation.js';
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

const exportedMethods = {
  async getAllUsers() {
    const userCollection = await users();
    const userList = await userCollection.find({}).toArray();
    return userList;
  },

  async getUserById(id) {
    id = validation.checkId(id, "User ID");
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    if (!user) throw 'Error: User not found';
    return user;
  },

  async getUserByEmail(email) {
    email = validation.checkEmail(email, "Email");
    const userCollection = await users();
    const user = await userCollection.findOne({ email: {"$regex": email, "$options": "i"} });
    if (!user) throw 'Error: User not found';
    return user;
  },

  async updateUserAnonymous(email, isAnonymous) {
    email = validation.checkEmail(email, "email");
    if (typeof isAnonymous !== 'boolean') "Error: isAnonymous must be a boolean";
    
    const usersCollection = await users();
    
    const updateResult = await usersCollection.findOneAndUpdate(
      { email: email },
      { $set: { isAnonymous: isAnonymous } },
      { returnDocument: "after" }
    );

    if (!updateResult) "Error: User not found";

    return {
      ...updateResult,
      _id: updateResult._id.toString()
    };
  },

  async updateUserFavorites(email, updatedFavorites) {
    email = validation.checkEmail(email, "Email");
    const userCollection = await users();
    const updateResult = await userCollection.findOneAndUpdate(
      {email: email}, 
      { $set : {favorites: updatedFavorites}},
      { returnDocument: "after" }
    );

    if (!updateResult) "Error: User not found";

    return {
      ...updateResult,
      _id: updateResult._id.toString()
    };
  },

  async addUser(firstName, lastName, email, password, isAnonymous = false, parksAttended = []) {
    // Validate first name
    try {
      firstName = validation.checkString(firstName, 'First name');
      firstName = validation.checkName(firstName, "First name");
    } catch (e) {
      throw new Error(`First name: ${e.toString().replace("Error: ", "")}`);
    }
    
    // Validate last name
    try {
      lastName = validation.checkString(lastName, 'Last name');
      lastName = validation.checkName(lastName, "Last name");
    } catch (e) {
      throw new Error(`Last name: ${e.toString().replace("Error: ", "")}`);
    }
    
    // Validate email
    try {
      email = validation.checkEmail(email, "Email");
    } catch (e) {
      throw new Error("Please enter a valid email address");
    }
    /*
    if (passwordInput) {
          const password = passwordInput.value;
          if (password.length < 8) {
              errors.push('Password must be at least 8 characters');
          }
          if (!/[A-Z]/.test(password)) {
              errors.push('Password must contain at least one uppercase letter');
          }
          if (!/[0-9]/.test(password)) {
              errors.push('Password must contain at least one number');
          }
      } else {
          errors.push('Password is required');
      }
          */
    // Validate password
    try {
      password = validation.checkString(password, 'Password');
      if(password.length < 8){
        throw new Error("Password must be at least 8 characters long");
      }
      if (!/[A-Z]/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter');
      }
      if (!/[0-9]/.test(password)) {
        throw new Error('Password must contain at least one number');
      }
      let specialChars = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
      let hasSpecial= false;
      for(let c of password){
        if(specialChars.includes(c)){
          hasSpecial=true;
        }
      }
      if(hasSpecial===false){
        throw new Error('Password must contain at least one special character');
      }
    } catch (e) {
      throw new Error(e.message || "Password is required");
    }
    
    // Validate isAnonymous
    if(isAnonymous !== true && isAnonymous !== false){
      throw new Error("isAnonymous must be a boolean");
    }
    
    // Check if user already exists
    if (await this.userExists(email)) {
      throw new Error("An account with this email address already exists");
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);


    //check parksAttended
    if(!Array.isArray(parksAttended)){
      parksAttended = []
    }
    for(let e of parksAttended){
      e = validation.checkId(e, "Location ID");
      e = await validation.locationExists(e);
    }
    
    let newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      isAnonymous: isAnonymous,
      favorites: [],
      parksAttended: parksAttended,
      createdAt: new Date()
    };
    const userCollection = await users();
    const newInsertInformation = await userCollection.insertOne(newUser);
    if (!newInsertInformation.insertedId) throw new Error('User creation failed');
    return await this.getUserById(newInsertInformation.insertedId.toString());
  },

  async userExists(email) {
    email = validation.checkEmail(email, "Email");
    const userCollection = await users();
    const user = await userCollection.findOne({ email: {"$regex": email, "$options": "i"}});
    return user !== null;
  }

};

export default exportedMethods;
