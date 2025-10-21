import { forums } from "../config/mongoCollections";
import validation from './validation.js';

const exportedMethods = {
  async getAllForums() {
    const forumCollection = await forums();
    const forumList = await forumCollection.find({}).toArray();
    return forumList;
  },

  async getForumById(id) {
    id = validation.checkId(id);
    const forumCollection = await forums();
    const forum = await forumCollection.findOne({ _id: new ObjectId(id) });
    if (!forum) throw 'Error: Forum not found';
    return forum;
  },

  async getForumByCourtId(courtId) {
    courtId = validation.checkId(courtId);
    const forumCollection = await forums();
    const forum = await forumCollection.findOne({ courtId: courtId });
    if (!forum) throw 'Error: Forum not found for the given courtId';
    return forum;
  }
};

export default exportedMethods;
