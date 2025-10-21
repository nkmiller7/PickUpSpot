import { users } from "../config/mongoCollections.js";
import validation from './validation.js';

const exportedMethods = {
  async getAllUsers() {
    const userCollection = await users();
    const userList = await userCollection.find({}).toArray();
    return userList;
  },

  async getUserById(id) {
    id = validation.checkId(id);
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(id) });
    if (!user) throw 'Error: User not found';
    return user;
  },

  async addUser(firstName, lastName, email, password, isAnnonymous = false) {
    firstName = validation.checkString(firstName, 'First name');
    lastName = validation.checkString(lastName, 'Last name');
    email = validation.checkEmail(email, "Email");
    password = validation.checkString(password, 'Password');

    let newUser = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      isAnnonymous: isAnnonymous
    };
    const userCollection = await users();
    const newInsertInformation = await userCollection.insertOne(newUser);
    if (!newInsertInformation.insertedId) throw 'Insert failed!';
    return await this.getUserById(newInsertInformation.insertedId.toString());
  },

};

export default exportedMethods;
