import { reviews } from "../config/mongoCollections.js";
import validation from './validation.js';
import { ObjectId } from 'mongodb';

const exportedMethods = {
  async getAllReviews() {
    const reviewCollection = await reviews();
    const reviewList = await reviewCollection.find({}).toArray();
    return reviewList;
  },

  async getReviewById(id) {
    id = validation.checkId(id, "Review ID");
    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({ _id: new ObjectId(id) });
    if (!review) throw 'Error: Review not found';
    return review;
  },

  async getReviewsByLocationId(locationId) {
    locationId = validation.checkId(locationId, "Location ID");
    locationId = await validation.locationExists(locationId);
    const reviewCollection = await reviews();
    const review = await reviewCollection.find({ locationId: new ObjectId(locationId) }).toArray();
    if (!review) throw 'Error: Review not found for the given locationId';
    return review;
  },

  async getReviewsByUserId(userId) {
    userId = validation.checkId(userId, "User ID");
    userId = await validation.userExists(userId);
    const reviewCollection = await reviews();
    const reviewList = await reviewCollection.find({ userId: userId }).toArray();
    return reviewList;
  },

  async addReview(userId, locationId, rating, comment) {
    userId = validation.checkId(userId, "User Id");
    userId = await validation.userExists(userId)
    locationId = validation.checkId(locationId);
    locationId= await validation.locationExists(locationId);
    rating = validation.checkNumber(rating, 'Rating');
    if (rating < 1 || rating > 5) throw 'Error: Rating must be between 1 and 5';
    if (rating.toString().includes(".") && rating.toString().split(".")[1].length > 1){
      throw "Error: At most one decimal place is allowed for Ratings";
    }
    comment = validation.checkString(comment, 'Comment');
    if (comment.length < 5 || comment.length > 250) throw 'Error: Comment must be between 5 and 250 characters, inclusive';
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
