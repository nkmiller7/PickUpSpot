import {dbConnection} from './mongoConnection.js';

/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this this */
const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

/* Now, you can list your collections here: */
export const courts = getCollectionFn('courts');
export const users = getCollectionFn('users');
export const reviews = getCollectionFn('reviews');
export const forums = getCollectionFn('forums');
export const games = getCollectionFn('games');



