import { reviews } from "../config/mongoCollections";
import validation from './validation.js';

const exportedMethods = {
  async getAllReviews() {
    const reviewCollection = await reviews();
    const reviewList = await reviewCollection.find({}).toArray();
    return reviewList;
  },

  async getReviewById(id) {
    id = validation.checkId(id);
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({ _id: new ObjectId(id) });
    if (!review) throw 'Error: Review not found';
    return review;
  }
};

export default exportedMethods;
