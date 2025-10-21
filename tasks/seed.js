import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { courts } from '../config/mongoCollections.js';
import  courtMethods from '../data/courts.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = await dbConnection();
await db.dropDatabase();

function cleanString(str) {
    return str ? str.trim() : null;
}

function parseCoordinates(lat, lon) {
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);
    return {
        lat: !isNaN(parsedLat) ? parsedLat : null,
        lon: !isNaN(parsedLon) ? parsedLon : null
    };
}

function formatCourtData(courtData, type) {
    const coords = parseCoordinates(courtData.lat, courtData.lon);
    
    return {
        propId: cleanString(courtData.Prop_ID),
        name: cleanString(courtData.Name),
        location: cleanString(courtData.Location),
        phone: cleanString(courtData.Phone),
        info: cleanString(courtData.Info),
        lat: coords.lat,
        lon: coords.lon,
        tennis: type === 'tennis' ? {
            numCourts: parseInt(courtData.Courts) || 0,
            indoorOutdoor: courtData.Indoor_Outdoor || null,
            surfaceType: courtData.Tennis_Type || 'Unknown',
            accessible: courtData.Accessible === 'Y'
        } : null,
        basketball: type === 'basketball' ? {
            numCourts: parseInt(courtData.Courts) || 0,
            indoorOutdoor: courtData.Indoor_Outdoor || null,
            accessible: courtData.Accessible === 'Y'
        } : null
    };
}

async function main() {
    try {
        const tennisData = JSON.parse(
            await fs.readFile(
                path.join(__dirname, 'DPR_Tennis_001.json'),
                'utf8'
            )
        );
        
        // can add basketball courts data here later
        
        console.log('Inserting tennis courts...');
        let successCount = 0;
        let errorCount = 0;
        
        for (const court of tennisData) {
            try {
                const courtData = formatCourtData(court, 'tennis');
                await courtMethods.createOrUpdateCourt(courtData);
                successCount++;
                console.log(`Successfully added/updated ${court.Name}`);
            } catch (e) {
                errorCount++;
                console.error(`Error adding court ${court.Name}: ${e}`);
            }
        }
        console.log(`Tennis courts seeding completed. Successfully added/updated ${successCount} courts. Failed to add ${errorCount} courts.`);
        console.log('Seeding completed!');
    } catch (e) {
        console.error('Error during seeding:', e);
        process.exit(1);
    } 

    try {
        const basketballData = JSON.parse(
            await fs.readFile(
                path.join(__dirname, 'DPR_Basketball_001.json'),
                'utf8'
            )
        );

        console.log('Inserting basketball courts...');
        let successCount = 0;
        let errorCount = 0;

        for (const court of basketballData) {
            try {
                const courtData = formatCourtData(court, 'basketball');
                await courtMethods.createOrUpdateCourt(courtData);
                successCount++;
                console.log(`Successfully added/updated ${court.Name}`);
            } catch (e) {
                errorCount++;
                console.error(`Error adding court ${court.Name}: ${e}`);
            }
        }
        console.log(`Basketball courts seeding completed. Successfully added/updated ${successCount} courts. Failed to add ${errorCount} courts.`);
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
