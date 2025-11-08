import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { locations } from '../config/mongoCollections.js';
import  userMethods from '../data/users.js';
import forumMethods from '../data/forums.js';
import locationMethods from '../data/locations.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await dbConnection();

async function main() {
    try {
        console.log('Inserting comments...');
        let successCount = 0;
        let errorCount = 0;
        let users = await userMethods.getAllUsers();
        let locations = await locationMethods.getAllLocations();
        if(!users){
            throw 'Failed to get users!';
        }
        const forumData=[
            {
                "locationId": locations[0]._id.toString(),
                "userId": users[0]._id.toString(),
                "content": "This park is awesome! I had so much fun!"
            },
            {
                "locationId": locations[0]._id.toString(),
                "userId": users[9]._id.toString(),
                "content": "What's up guys, looking for a couple buddies to play a few games of basketball with, preferably at advanced difficulty. Keep up if you can!"
            },
            {
                "locationId": locations[0]._id.toString(),
                "userId": users[7]._id.toString(),
                "content": "This park is falling apart! It's sad to see :("
            },
        ]
        for (const comment of forumData) {
            try {
                await forumMethods.createMessage(comment.locationId, comment.userId, comment.content);
                successCount++;
                console.log(`Successfully added/updated ${comment.content}`);
            } catch (e) {
                errorCount++;
                console.error(`Error adding user ${comment.content}: ${e}`);
            }
        }
        console.log(`User seeding completed. Successfully added/updated ${successCount} comments. Failed to add ${errorCount} comments.`);
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
