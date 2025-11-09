import userRoutes from './users.js';
import locationRoutes from './locations.js';
import reviewRoutes from './reviews.js';
import forumRoutes from './forums.js';
import aboutRoutes from './about.js';


const constructorMethod = (app) => {
  app.use('/users', userRoutes);
  app.use('/locations', locationRoutes);
  app.use('/reviews', reviewRoutes);
  app.use('/forums', forumRoutes);
  app.use('/about', aboutRoutes);

  app.use('{*splat}', (req, res) => {
    return res.status(404).render('errors/404');
  });
};

export default constructorMethod;