import express from 'express';
import configRoutesFunction from './routes/index.js'

const app = express();
configRoutesFunction(app);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});


