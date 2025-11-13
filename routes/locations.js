import {Router} from 'express';
import { locationData } from '../data/index.js';
import { forumData } from '../data/index.js';
import { userData } from '../data/index.js';
import { reviewData } from '../data/index.js';
import { searchLocation } from '../data/Query.js'; 
import { users } from "../config/mongoCollections.js"; 
import validation from '../data/validation.js';

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
    const id = validation.checkId(req.params.id);
    const location = await locationData.getLocationById(id);
    const forumOld = await forumData.getForumMessagesByLocationId(id);
    const forum = [];
    for(let c of forumOld.reverse()){
      let user = await userData.getUserById(c.userId.toString());
      if(user.isAnonymous === false){
      forum.push(
          {
            userName: user.firstName+" "+user.lastName,
            content: c.content,
            createdAt: c.createdAt
          }
        )
      }else{
        forum.push(
          {
            content: c.content,
            createdAt: c.createdAt
          }
        )
      }
    }
    const reviewsOld= await reviewData.getReviewsByLocationId(id);
    const reviews = [];
    const ratings = [];
    for(let r of reviewsOld){
      let user = await userData.getUserById(r.userId.toString());
      if(user.isAnonymous === false){
        reviews.push(
          {
            userName: user.firstName+" "+user.lastName,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          }
        )
      }else{
        reviews.push(
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
    const averageRating = ratings_sum/ratings.length;
    res.render('locations/single', { location: location, forum: forum, 
      reviews: reviews, averageRating: averageRating, singleLocation: true, 
      user: req.session.user, locationId: id});
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
})
  .post(async(req, res) => {
    const id = validation.checkId(req.params.id);
    const location = await locationData.getLocationById(id);
    const forumOld = await forumData.getForumMessagesByLocationId(id);
    const forum = [];
    for(let c of forumOld.reverse()){
      let user = await userData.getUserById(c.userId.toString());
      if(user.isAnonymous === false){
      forum.push(
          {
            userName: user.firstName+" "+user.lastName,
            content: c.content,
            createdAt: c.createdAt
          }
        )
      }else{
        forum.push(
          {
            content: c.content,
            createdAt: c.createdAt
          }
        )
      }
    }
    const reviewsOld= await reviewData.getReviewsByLocationId(id);
    const reviews = [];
    const ratings = [];
    for(let r of reviewsOld){
      let user = await userData.getUserById(r.userId.toString());
      if(user.isAnonymous === false){
        reviews.push(
          {
            userName: user.firstName+" "+user.lastName,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          }
        )
      }else{
        reviews.push(
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
    const averageRating = ratings_sum/ratings.length;
    let errors = [];
    try{
      const locationId = validation.checkId(req.params.id, "Location ID");
      const userCollection = await users();
      const user = await userCollection.findOne({email: req.session.user.email});
      if(!user){
        throw 'Error: User not found';
      }
      const userId = user._id.toString();
      const content = req.body.content;
      content= content.checkString(content, "Comment Content");
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
        reviews: reviews, 
        averageRating: averageRating, 
        singleLocation: true, 
        user: req.session.user, 
        locationId: id
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

