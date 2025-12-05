import {Router} from 'express';
import { reviewData } from '../data/index.js';
import { locationData } from '../data/index.js';
import validation from '../data/validation.js';
import { users } from "../config/mongoCollections.js"; 
import { reviews } from  "../config/mongoCollections.js"; 
import { ObjectId } from "mongodb";

const router = Router();

router.get('/', async (req, res) => {
  try {
    const reviewList = await reviewData.getAllReviews();
    res.json(reviewList);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router
.route('/review/:id')
.get(async (req, res) => {
  try{
    let alreadyReviewed;
    const locationId= req.params.id;
    const userCollection = await users();
    const user = await userCollection.findOne({email: req.session.user.email});
    if(!user){
      throw 'Error: User not found';
    }
    const userId = user._id.toString();
    const reviewCollection= await reviews();
    const oldReview= await reviewCollection.find({$and: [{userId: new ObjectId(userId)}, {locationId: new ObjectId(locationId)}]}).toArray();
    if(oldReview.length === 0){
      alreadyReviewed= false;
    }else{
      alreadyReviewed= true;
    }
    res.render('review/review', {locationId: locationId, alreadyReviewed: alreadyReviewed, isReview: true});
  }catch(e){
    res.status(500).json({ error: e.toString() });
  }
})
.post(async (req, res) => {
    const formData = req.body;
    let errors = [];
    let locationId;
    let userId;
    try{
      formData.rating = validation.checkNumber(formData.rating, 'Rating');
      if (formData.rating < 1 || formData.rating > 5) throw 'Error: Rating must be between 1 and 5';
      if (formData.rating.toString().includes(".") && formData.rating.toString().split(".")[1].length > 1){
        throw "Error: At most one decimal place is allowed for Ratings";
      }
    }catch(e){
      errors.push(e);
    }
    try{
      formData.comment = validation.checkString(formData.comment, 'Comment');
      if (formData.comment.length < 5 || formData.comment.length > 250) throw 'Error: Comment must be between 5 and 250 characters, inclusive';
      let exists_letters= false;
      for(let c of formData.comment){
          if(validation.isLetter(c)){
              exists_letters=true;
              break;
          }
      }
      if(exists_letters===false){
          throw 'Error: Review comment must contain letters'
      }
    }catch(e){
      errors.push(e);
    }
    try{
      locationId = validation.checkId(req.params.id, "Location ID");
    }catch(e){
       errors.push(e);
    }
    try{
      const userCollection = await users();
      const user = await userCollection.findOne({email: req.session.user.email});
      if(!user){
        throw 'Error: User not found';
      }
      userId = user._id.toString();
    }catch(e){
      errors.push(e);
    }
    if (errors.length > 0){
      res.render(`review/review`, {
        locationId: locationId,
        errors: errors,
        hasErrors: true,
        rating: formData.rating,
        comment: formData.comment,
        isReview: true
      });
      return;
    }
    try{
      let isReported;
      if(formData.reportCheckbox){
        isReported=true;
      }else{
        isReported=false;
      }
      let {rating, comment} = formData;
      const newReview= await reviewData.addReview(userId, locationId, rating, comment, isReported);
      res.redirect(`/locations/${locationId}`);
    }catch(e){
      res.status(500).json({error: e.toString()});
    }
  })
  .put(async (req, res) => {
    const formData = req.body;
    let errors = [];
    let locationId;
    let userId;
    try{
      formData.rating = validation.checkNumber(formData.rating, 'Rating');
      if (formData.rating < 1 || formData.rating > 5) throw 'Error: Rating must be between 1 and 5';
      if (formData.rating.toString().includes(".") && formData.rating.toString().split(".")[1].length > 1){
        throw "Error: At most one decimal place is allowed for Ratings";
      }
    }catch(e){
      errors.push(e);
    }
    try{
      formData.comment = validation.checkString(formData.comment, 'Comment');
      if (formData.comment.length < 5 || formData.comment.length > 250) throw 'Error: Comment must be between 5 and 250 characters, inclusive';
      let exists_letters = false;
      for (let c of formData.comment) {
        if (validation.isLetter(c)) {
          exists_letters = true;
          break;
        }
      }
      if (exists_letters === false) {
        throw "Error: Comment content must contain letters";
      }
    }catch(e){
      errors.push(e);
    }
    
    try{
      locationId = validation.checkId(req.params.id, "Location ID");
    }catch(e){
       errors.push(e);
    }
    let isReported;
    if(formData.reportCheckbox){
      isReported=true;
    }else{
      isReported=false;
    }
    try{
      const userCollection = await users();
      const user = await userCollection.findOne({email: req.session.user.email});
      if(!user){
        throw 'Error: User not found';
      }
      userId = user._id.toString();
    }catch(e){
      errors.push(e);
    }
    try{
      const userIdData= new ObjectId(userId);
      const locationIdData= new ObjectId(locationId);
      const reviewCollection= await reviews();
      const oldReview= await reviewCollection.find({$and: [{userId: userIdData}, {locationId: locationIdData}]}).toArray();
      if(oldReview.length===0){
        throw `Error: Could not update the review with User ID ${userId} and Location ID ${locationId}`;
      }
    }catch(e){
      errors.push(e);
    }
    if (errors.length > 0){
      res.render(`review/review`, {
        locationId: locationId,
        errors: errors,
        hasErrors: true,
        rating: formData.rating,
        alreadyReviewed: true,
        comment: formData.comment,
        isReview: true
      });
      return;
    }
    try{
      const {rating, comment} = formData;
      const updatedReview= await reviewData.updateReview(userId, locationId, rating, comment, isReported);
      res.redirect(`/locations/${locationId}`);
    }catch(e){
      res.status(500).json({error: e.toString()});
    }
  });

router.get('/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const review = await reviewData.getReviewById(id);
    res.json(review);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const reviewList = await reviewData.getReviewsByUserId(id);
    res.json(reviewList);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

router.get('/locations/:id', async (req, res) => {
  try {
    const id = validation.checkId(req.params.id);
    const review = await reviewData.getReviewsByLocationId(id);
    res.json(review);
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});



export default router;