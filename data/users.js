import { users } from "../config/mongoCollections.js";
import validation from './validation.js';
import { ObjectId } from "mongodb";

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

  async addUser(firstName, lastName, email, password, isAnonymous = false) {
    firstName = validation.checkString(firstName, 'First name');
    lastName = validation.checkString(lastName, 'Last name');
    email = validation.checkEmail(email, "Email");
    //We need to come up with password criteria
    password = validation.checkString(password, 'Password');
    if(password.length < 8){
      throw "Error: password must be at least 8 characters long";
    }
    if(isAnonymous !== true && isAnonymous!==false){
      throw "Error: isAnonymous must be a boolean";
    }
    let newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      isAnonymous: isAnonymous,
      favorites: [],
      parksAttended: [],
      createdAt: new Date()
    };
    const userCollection = await users();
    const newInsertInformation = await userCollection.insertOne(newUser);
    if (!newInsertInformation.insertedId) throw 'Insert failed!';
    return await this.getUserById(newInsertInformation.insertedId.toString());
  },

};

export default exportedMethods;
