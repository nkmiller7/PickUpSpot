import { courts } from "../config/mongoCollections";
import validation from './validation.js';

const exportedMethods = {
  async getAllCourts() {
    const courtCollection = await courts();
    const courtList = await courtCollection.find({}).toArray();
    return courtList;
  },

  async getCourtById(id) {
    id = validation.checkId(id);
    const courtCollection = await courts();
    const court = await courtCollection.findOne({ _id: new ObjectId(id) });
    if (!court) throw 'Error: Court not found';
    return court;
  }
};

export default exportedMethods;