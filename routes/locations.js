import {Router} from 'express';
import { locationData } from '../data/index.js';
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
    res.render('locations/single', { location: location });
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

export default router;

