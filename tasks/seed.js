import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { locations } from '../config/mongoCollections.js';
import  locationMethods from '../data/locations.js';
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

function formatLocationData(locationData, type) {
    const coords = parseCoordinates(locationData.lat, locationData.lon);

    return {
        propId: cleanString(locationData.Prop_ID),
        name: cleanString(locationData.Name),
        location: cleanString(locationData.Location),
        phone: cleanString(locationData.Phone),
        info: cleanString(locationData.Info),
        lat: coords.lat,
        lon: coords.lon,
        tennis: type === 'tennis' ? {
            numCourts: parseInt(locationData.Courts) || 0,
            indoorOutdoor: locationData.Indoor_Outdoor || null,
            surfaceType: locationData.Tennis_Type || 'Unknown',
            accessible: locationData.Accessible === 'Y'
        } : null,
        basketball: type === 'basketball' ? {
            numCourts: parseInt(locationData.Courts) || 0,
            indoorOutdoor: locationData.Indoor_Outdoor || null,
            accessible: locationData.Accessible === 'Y'
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
        
        for (const location of tennisData) {
            try {
                const locationData = formatLocationData(location, 'tennis');
                await locationMethods.createOrUpdateLocation(locationData);
                successCount++;
                console.log(`Successfully added/updated ${location.Name}`);
            } catch (e) {
                errorCount++;
                console.error(`Error adding location ${location.Name}: ${e}`);
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

        for (const location of basketballData) {
            try {
                const locationData = formatLocationData(location, 'basketball');
                await locationMethods.createOrUpdateLocation(locationData);
                successCount++;
                console.log(`Successfully added/updated ${location.Name}`);
            } catch (e) {
                errorCount++;
                console.error(`Error adding location ${location.Name}: ${e}`);
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
