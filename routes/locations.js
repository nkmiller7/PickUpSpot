import {Router} from 'express';
import { locationData } from '../data/index.js';
import { forumData } from '../data/index.js';
import { userData } from '../data/index.js';
import { reviewData } from '../data/index.js';
import validation from '../data/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const locationList = await locationData.getAllLocations();
    res.render('locations/index', { locations: locationList });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

router.get('/:id', async (req, res) => {
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
    res.render('locations/single', { location: location, forum: forum, reviews: reviews, averageRating: averageRating});
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

export default router;

