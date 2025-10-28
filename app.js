import express from 'express';
import configRoutesFunction from './routes/index.js'
import exphbs from 'express-handlebars';



const app = express();
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

configRoutesFunction(app);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});


