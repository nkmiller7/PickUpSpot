import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { locations } from '../config/mongoCollections.js';
import  userMethods from '../data/users.js';
import forumMethods from '../data/forums.js';
import locationMethods from '../data/locations.js';
import reviewMethods from '../data/reviews.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await dbConnection();

async function main() {
    try {
        console.log('Inserting reviews...');
        let successCount = 0;
        let errorCount = 0;
        let users = await userMethods.getAllUsers();
        let locations = await locationMethods.getAllLocations();
        if(!users){
            throw 'Failed to get users!';
        }
        const reviewData=[
            {
                "userId": users[0]._id.toString(),
                "locationId": locations[0]._id.toString(),
                "rating": 5,
                "comment": "This park is awesome! I had so much fun!"
            },
            {
                "userId": users[9]._id.toString(),
                "locationId": locations[0]._id.toString(),
                "rating": 3,
                "comment": "This park is just ok."
            },
            {
                "userId": users[7]._id.toString(),
                "locationId": locations[0]._id.toString(),
                "rating": 1,
                "comment": "This park is falling apart! It's sad to see :("
            },
        ]
        for (const review of reviewData) {
            try {
                await reviewMethods.addReview(review.userId, review.locationId, review.rating, review.comment);
                successCount++;
                console.log(`Successfully added/updated ${review.rating}`);
            } catch (e) {
                errorCount++;
                console.error(`Error adding review ${review.rating}: ${e}`);
            }
        }
        console.log(`User seeding completed. Successfully added/updated ${successCount} reviews. Failed to add ${errorCount} reviews.`);
        console.log('Seeding completed!');
    } catch (e) {
        console.error('Error during seeding:', e);
        process.exit(1);
    }


}

main().then(() => {
    console.log('Done seeding database');
}).catch((e) => {
    console.error(e);
}).finally(() => {
    console.log('Closing connection to database');
    process.exit(0);
});
