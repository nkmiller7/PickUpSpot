import { reviews } from "../config/mongoCollections.js";
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
  },

  async getReviewByLocationId(locationId) {
    locationId = validation.checkId(locationId);
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({ locationId: locationId });
    if (!review) throw 'Error: Review not found for the given locationId';
    return review;
  },

  async getReviewsByUserId(userId) {
    userId = validation.checkId(userId);
    const reviewCollection = await reviews();
    const reviewList = await reviewCollection.find({ userId: userId }).toArray();
    return reviewList;
  },

  async addReview(userId, locationId, rating, comment) {
    userId = validation.checkId(userId);
    locationId = validation.checkId(locationId);
    rating = validation.checkNumber(rating, 'Rating');
    if (rating < 1 || rating > 5) throw 'Error: Rating must be between 1 and 5';
    comment = validation.checkString(comment, 'Comment');
    if (comment.length > 250) throw 'Error: Comment cannot exceed 250 characters';

    const newReview = {
      userId: new ObjectId(userId),
      locationId: new ObjectId(locationId),
      rating: rating,
      comment: comment,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const reviewCollection = await reviews();
    const insertInfo = await reviewCollection.insertOne(newReview);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Error: Could not add review';
    const newId = insertInfo.insertedId.toString();
    const review = await this.getReviewById(newId);
    return review;
  }
};

export default exportedMethods;
