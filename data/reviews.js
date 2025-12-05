import { reviews } from "../config/mongoCollections.js";
import validation from './validation.js';
import locationData from "./locations.js";
import { ObjectId } from 'mongodb';
import { users } from "../config/mongoCollections.js"; 

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
    const reviewList = await reviewCollection.find({ userId: new ObjectId(userId) }).toArray();
    return reviewList;
  },

  async addReview(userId, locationId, rating, comment, isReported) {
    userId = validation.checkId(userId, "User Id");
    userId = await validation.userExists(userId);
    const userCollection = await users();
    const user = await userCollection.findOne({_id: new ObjectId(userId)});
    locationId = validation.checkId(locationId);
    locationId= await validation.locationExists(locationId);
    if(!user.parksAttended.includes(locationId)){
      throw "Error: User must have visited the park to leave a review";
    }
    rating = validation.checkNumber(rating, 'Rating');
    if (rating < 1 || rating > 5) throw 'Error: Rating must be between 1 and 5';
    if (rating.toString().includes(".") && rating.toString().split(".")[1].length > 1){
      throw "Error: At most one decimal place is allowed for Ratings";
    }
    comment = validation.checkString(comment, 'Comment');
    if (comment.length < 5 || comment.length > 250) throw 'Error: Comment must be between 5 and 250 characters, inclusive';
    let exists_letters= false;
    for(let c of comment){
      if(validation.isLetter(c)){
        exists_letters=true;
        break;
      }
    }
    if(exists_letters===false){
      throw 'Error: Review comment must contain letters'
    }
    if(typeof isReported!=="boolean"){
      throw 'Error: isReported must be a boolean'
    }
    const newReview = {
      userId: new ObjectId(userId),
      locationId: new ObjectId(locationId),
      rating: rating,
      comment: comment,
      isReported: isReported,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const reviewCollection = await reviews();
    const insertInfo = await reviewCollection.insertOne(newReview);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Error: Could not add review';
    if(isReported===true){
        await locationData.updateLocationReports(locationId, "+");
    }
    const newId = insertInfo.insertedId.toString();
    const review = await this.getReviewById(newId);
    return review;
  },
  async updateReview(userId, locationId, rating, comment, isReported){
    userId = validation.checkId(userId, "User Id");
    userId = await validation.userExists(userId);
    const userCollection = await users();
    const user = await userCollection.findOne({_id: new ObjectId(userId)});
    locationId = validation.checkId(locationId);
    locationId= await validation.locationExists(locationId);
    rating = validation.checkNumber(rating, 'Rating');
    if (rating < 1 || rating > 5) throw 'Error: Rating must be between 1 and 5';
    if (rating.toString().includes(".") && rating.toString().split(".")[1].length > 1){
      throw "Error: At most one decimal place is allowed for Ratings";
    }
    comment = validation.checkString(comment, 'Comment');
    if (comment.length < 5 || comment.length > 250) throw 'Error: Comment must be between 5 and 250 characters, inclusive';
    const reviewCollection= await reviews();
    const userIdData= new ObjectId(userId);
    const locationIdData= new ObjectId(locationId);
    const oldReview= await reviewCollection.find({$and: [{userId: userIdData}, {locationId: locationIdData}]}).toArray();
    if(oldReview.length===0){
      throw `Could not update the review with User ID ${userId} and Location ID ${locationId}`;
    }
    if(typeof isReported!== "boolean"){
      throw 'isReported must be a boolean';
    }
     let updatedReviewInfo = {
      userId: userIdData,
      locationId: locationIdData,
      rating: rating,
      comment: comment,
      isReported: isReported,
      createdAt: oldReview[0].createdAt,
      updatedAt: new Date()
    };
    const updateInfo = await reviewCollection.findOneAndReplace(
      {$and: [{userId: userIdData}, {locationId: locationIdData}]},
      updatedReviewInfo,
      {returnDocument: 'after'}
    );
    if (!updateInfo)
      throw `Could not update the review with User ID ${userId} and Location ID ${locationId}`;
    if(isReported){
      if(!oldReview[0].isReported){
        await locationData.updateLocationReports(locationId, "+");
      }
    }else{
      if(oldReview[0].isReported){
        await locationData.updateLocationReports(locationId, "-");
      }
    }
    return updateInfo.value;
  }
};

export default exportedMethods;
