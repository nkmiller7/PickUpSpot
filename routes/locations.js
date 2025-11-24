import {Router} from 'express';
import { locationData } from '../data/index.js';
import { forumData } from '../data/index.js';
import { userData } from '../data/index.js';
import { reviewData } from '../data/index.js';
import { searchLocation } from '../data/Query.js'; 
import { users } from "../config/mongoCollections.js"; 
import validation from '../data/validation.js';
import { reviews } from  "../config/mongoCollections.js"; 
import { ObjectId } from "mongodb";
import { forums } from "../config/mongoCollections.js";


const router = Router();

router.get('/', async (req, res) => {
  try {
    let searchTerm = null;
    if (req.query.searchTerm && req.query.searchTerm.trim()) {
      searchTerm = req.query.searchTerm.trim();
    }
    
    let sport = null;
    if (req.query.sport && req.query.sport.trim()) {
      sport = req.query.sport.trim();
    }
    
    let accessible = null;
    if (req.query.accessible && req.query.accessible.trim() && req.query.accessible === 'true') {
      accessible = true;
    }
    
    let indoorOutdoor = null;
    if (req.query.indoorOutdoor && req.query.indoorOutdoor.trim()) {
      indoorOutdoor = req.query.indoorOutdoor.trim();
    }
    
    let courtType = null;
    if (req.query.courtType && req.query.courtType.trim()) {
      courtType = req.query.courtType.trim();
    }

    let locationList;
    
    if (searchTerm || sport || accessible !== null || indoorOutdoor || courtType) {
      locationList = await searchLocation(searchTerm, sport, accessible, courtType, indoorOutdoor);
    } else {
      locationList = await locationData.getAllLocations();
    }

    let user = await userData.getUserByEmail(req.session.user.email); 
  
    locationList = locationList.map((location) => {
      let isFavorite = user.favorites.includes(location._id.toString());
      return { ...location, isFavorite }; 
    });
    
    res.render('locations/index', { 
      locations: locationList,
      isLocationsPage: true,
      searchValues: {
        searchTerm: searchTerm || '',
        sport: sport || '',
        accessible: accessible !== null ? accessible.toString() : '',
        indoorOutdoor: indoorOutdoor || '',
        courtType: courtType || ''
      },
      resultCount: locationList.length,
      user: req.session.user
    });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router
  .route('/:id')
  .get(async (req, res) => {
  try {
    const userCollection = await users();
    const user = await userCollection.findOne({email: req.session.user.email});
    if(!user){
      throw 'Error: User not found'
    }
    const userId = user._id.toString();
    const id = validation.checkId(req.params.id);
    const location = await locationData.getLocationById(id);
    const forumOld = await forumData.getForumMessagesByLocationId(id);
    const forum = [];
    for(let c of forumOld.reverse()){
      let user = await userData.getUserById(c.userId.toString());
      if(user.isAnonymous === false){
      forum.push(
          {
            messageId: c._id,
            userName: user.firstName+" "+user.lastName,
            content: c.content,
            createdAt: c.createdAt,
            byUser: userId === c.userId.toString()
          }
        )
      }else{
        forum.push(
          {
            messageId: c._id,
            content: c.content,
            createdAt: c.createdAt,
            byUser: userId === c.userId.toString()
          }
        )
      }
    }
    const reviewsOld= await reviewData.getReviewsByLocationId(id);
    const reviewList = [];
    const ratings = [];
    for(let r of reviewsOld){
      let user = await userData.getUserById(r.userId.toString());
      if(user.isAnonymous === false){
        reviewList.push(
          {
            userName: user.firstName+" "+user.lastName,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          }
        )
      }else{
        reviewList.push(
          {
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          }
        )
      }
      ratings.push(r.rating);
    }
    let ratings_sum = 0;
    for(let rating of ratings){
      ratings_sum+=rating;
    }
    let averageRating = (ratings_sum/ratings.length).toFixed(1);
    averageRating = parseFloat(averageRating);
    if(!user){
      throw 'Error: User not found';
    }
    const hasVisited = (user.parksAttended.includes(id));
    const reviewCollection= await reviews();
    const oldReview= await reviewCollection.find({$and: [{userId: new ObjectId(userId)}, {locationId: new ObjectId(id)}]}).toArray();
    let alreadyReviewed;
    if(oldReview.length === 0){
      alreadyReviewed= false;
    }else{
      alreadyReviewed= true;
    }
    res.render('locations/single', { location: location, forum: forum, 
      reviews: reviewList, averageRating: averageRating, singleLocation: true, 
      user: req.session.user, locationId: id, hasVisited: hasVisited, alreadyReviewed: alreadyReviewed});
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
})
  .post(async(req, res) => {
    const userCollection = await users();
    const user = await userCollection.findOne({email: req.session.user.email});
    if(!user){
      throw 'Error: User not found';
    }
    const userId = user._id.toString();
    const id = validation.checkId(req.params.id);
    const location = await locationData.getLocationById(id);
    const forumOld = await forumData.getForumMessagesByLocationId(id);
    const forum = [];
    for(let c of forumOld.reverse()){
      let user = await userData.getUserById(c.userId.toString());
      if(user.isAnonymous === false){
      forum.push(
          {
            messageId: c._id,
            userName: user.firstName+" "+user.lastName,
            content: c.content,
            createdAt: c.createdAt,
            byUser: userId === c.userId.toString()
          }
        )
      }else{
        forum.push(
          {
            messageId: c._id,
            content: c.content,
            createdAt: c.createdAt,
            byUser: userId === c.userId.toString()
          }
        )
      }
    }
    const reviewsOld= await reviewData.getReviewsByLocationId(id);
    const reviewList = [];
    const ratings = [];
    for(let r of reviewsOld){
      let user = await userData.getUserById(r.userId.toString());
      if(user.isAnonymous === false){
        reviewList.push(
          {
            userName: user.firstName+" "+user.lastName,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          }
        )
      }else{
        reviewList.push(
          {
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          }
        )
      }
      ratings.push(r.rating);
    }
    let ratings_sum = 0;
    for(let rating of ratings){
      ratings_sum+=rating;
    }
    let averageRating = (ratings_sum/ratings.length).toFixed(1);
    averageRating = parseFloat(averageRating);
    let errors = [];
    let hasVisited= false;
    let alreadyReviewed;
    try{
      const locationId = validation.checkId(req.params.id, "Location ID");
      hasVisited=user.parksAttended.includes(id);
      const reviewCollection= await reviews();
      const oldReview= await reviewCollection.find({$and: [{userId: new ObjectId(userId)}, {locationId: new ObjectId(id)}]}).toArray();
      if(oldReview.length === 0){
        alreadyReviewed= false;
      }else{
        alreadyReviewed= true;
      }
      let content = req.body.content;
      content= validation.checkString(content, "Comment Content");
      if(content.length < 5 || content.length > 500){
        throw 'Error: Message content must be between 5 and 500 characters, inclusive';
      }
      await forumData.createMessage(locationId, userId, content);
    } catch(e){
      errors.push(e);
    }
    if(errors.length > 0){
      res.render('locations/single', {
        errors: errors,
        hasErrors: true,
        content: req.body.content,
        location: location, 
        forum: forum, 
        reviews: reviewList, 
        averageRating: averageRating, 
        singleLocation: true, 
        user: req.session.user, 
        locationId: id,
        hasVisited: hasVisited,
        alreadyReviewed: alreadyReviewed
      });
      return;
    }
    try{
      res.redirect(`/locations/${req.params.id}`);
    }catch(e){
      res.status(500).json({error: e});
    }
})
  .delete(async(req, res) => {
    const userCollection = await users();
      const user = await userCollection.findOne({email: req.session.user.email});
      if(!user){
        throw 'Error: User not found';
      }
    const userId = user._id.toString();
    const id = validation.checkId(req.params.id);
    const location = await locationData.getLocationById(id);
    const forumOld = await forumData.getForumMessagesByLocationId(id);
    const forum = [];
    for(let c of forumOld.reverse()){
      let user = await userData.getUserById(c.userId.toString());
      if(user.isAnonymous === false){
      forum.push(
          {
            messageId: c._id,
            userName: user.firstName+" "+user.lastName,
            content: c.content,
            createdAt: c.createdAt,
            byUser: userId === c.userId.toString()
          }
        )
      }else{
        forum.push(
          {
            messageId: c._id,
            content: c.content,
            createdAt: c.createdAt,
            byUser: userId === c.userId.toString()
          }
        )
      }
    }
    const reviewsOld= await reviewData.getReviewsByLocationId(id);
    const reviewList = [];
    const ratings = [];
    for(let r of reviewsOld){
      let user = await userData.getUserById(r.userId.toString());
      if(user.isAnonymous === false){
        reviewList.push(
          {
            userName: user.firstName+" "+user.lastName,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          }
        )
      }else{
        reviewList.push(
          {
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          }
        )
      }
      ratings.push(r.rating);
    }
    let ratings_sum = 0;
    for(let rating of ratings){
      ratings_sum+=rating;
    }
    let averageRating = (ratings_sum/ratings.length).toFixed(1);
    averageRating = parseFloat(averageRating);
    let errors = [];
    let hasVisited= false;
    let alreadyReviewed;
    try{
      const locationId = validation.checkId(req.params.id, "Location ID");
      hasVisited=user.parksAttended.includes(id);
      const reviewCollection= await reviews();
      const oldReview= await reviewCollection.find({$and: [{userId: new ObjectId(userId)}, {locationId: new ObjectId(id)}]}).toArray();
      if(oldReview.length === 0){
        alreadyReviewed= false;
      }else{
        alreadyReviewed= true;
      }
      let messageId= req.body.messageId;
      messageId = validation.checkId(messageId, "Message ID");
      const messageCollection = await forums();
      const message= await messageCollection.findOne({_id: new ObjectId(messageId)});
      if(!message){
        throw 'Error: message not found'
      }
      if (message.userId.toString() !== userId) throw 'Error: You can only delete your own messages';
      await forumData.deleteMessage(messageId, userId);
    }catch(e){
      errors.push(e);
    }
    if(errors.length > 0){
      res.render('locations/single', {
        errors: errors,
        hasErrors: true,
        content: req.body.content,
        location: location, 
        forum: forum, 
        reviews: reviewList, 
        averageRating: averageRating, 
        singleLocation: true, 
        user: req.session.user, 
        locationId: id,
        hasVisited: hasVisited,
        alreadyReviewed: alreadyReviewed,
      });
      return;
    }
    try{
      res.redirect(`/locations/${req.params.id}`);
    }catch(e){
      res.status(500).json({error: e});
    }
  })
  
export default router;

