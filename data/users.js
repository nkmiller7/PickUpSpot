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
    const user = await userCollection.findOne({ email: email});
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

  async addUser(firstName, lastName, email, password, isAnonymous = false, parksAttended=[]) {
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
    
    // Validate password
    try {
      password = validation.checkString(password, 'Password');
      if(password.length < 8){
        throw new Error("Password must be at least 8 characters long");
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
    let newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      isAnonymous: isAnonymous,
      favorites: [],
      parksAttended: [],
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
    const user = await userCollection.findOne({ email: email});
    return user !== null;
  }

};

export default exportedMethods;
