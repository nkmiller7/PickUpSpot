import { Router } from 'express';
import { userData, reviewData, locationData } from '../data/index.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    if (!req.session || !req.session.user){
         return res.redirect('/');
    }
    const userId = req.session.user.userId;
    if (!userId){
         return res.redirect('/');
    }
    const user = await userData.getUserById(userId);
    let parksAttended = [];
    if (Array.isArray(user.parksAttended)) {
      parksAttended = user.parksAttended;
    }
    const reviews = await reviewData.getReviewsByUserId(userId);
    const reviewedLocationIds = new Set(reviews.map(r => r.locationId.toString()));
    const messages = [];
    for (const locId of parksAttended) {
      if (!locId) {
        continue;
      }
      if (reviewedLocationIds.has(locId.toString())) {
        continue;
      }
      try {
        const location = await locationData.getLocationById(locId);
        messages.push({
          id: locId.toString(),
          type: 'review',
          title: `Please review: ${location.name}`,
          body: `You visited ${location.name}. Please share your experience to help others.`,
          primary: { label: 'Write review', href: `/reviews/review/${locId.toString()}` },
          secondary: { label: 'View park', href: `/locations/${locId.toString()}` }
        });
      } catch (e) {
        continue;
      }
    }

    return res.render('inbox/index', { user: req.session.user, messages, isInboxPage: true });
  } catch (e) {
    return res.status(500).render('errors/404', { error: e.toString() });
  }
});

export default router;