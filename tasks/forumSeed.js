import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { locations } from '../config/mongoCollections.js';
import  locationMethods from '../data/locations.js';
import userMethods from '../data/users.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await dbConnection();
await db.dropDatabase();

async function main() {
    try {
        const userData = JSON.parse(
            await fs.readFile(
                path.join(__dirname, 'Sample_Users.json'),
                'utf8'
            )
        );
        console.log('Inserting users...');
        let successCount = 0;
        let errorCount = 0;
        for (const user of userData) {
            try {
                await userMethods.addUser(user.firstName, user.lastName, user.email, user.password, user.isAnonymous);
                successCount++;
                console.log(`Successfully added/updated ${user.firstName}`);
            } catch (e) {
                errorCount++;
                console.error(`Error adding user ${user.firstName}: ${e}`);
            }
        }
        console.log(`User seeding completed. Successfully added/updated ${successCount} users. Failed to add ${errorCount} users.`);
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
