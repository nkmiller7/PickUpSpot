import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { locations } from '../config/mongoCollections.js';
import  locationMethods from '../data/locations.js';
import forumMethods from '../data/forums.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await dbConnection();

async function main() {
    try {
        const forumData = JSON.parse(
            await fs.readFile(
                path.join(__dirname, 'Sample_Comments.json'),
                'utf8'
            )
        );
        console.log('Inserting comments...');
        let successCount = 0;
        let errorCount = 0;
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
