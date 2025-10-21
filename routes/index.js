import userRoutes from './users.js';
import courtRoutes from './courts.js';
import reviewRoutes from './reviews.js';
import forumRoutes from './forums.js';


const constructorMethod = (app) => {
  app.use('/users', userRoutes);
  app.use('/courts', courtRoutes);
  app.use('/reviews', reviewRoutes);
  app.use('/forums', forumRoutes);

  app.use('{*splat}', (req, res) => {
    return res.status(404).json({error: 'Not found'});
  });
};

export default constructorMethod;