import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import locationMethods from '../data/locations.js';
import userMethods from '../data/users.js';
import forumMethods from '../data/forums.js';
import reviewMethods from '../data/reviews.js';
import {gameData} from '../data/index.js';
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
            accessible: locationData.Accessible
        } : null,
        basketball: type === 'basketball' ? {
            numCourts: parseInt(locationData.Courts) || 0,
            indoorOutdoor: locationData.Indoor_Outdoor || null,
            accessible: locationData.Accessible
        } : null
    };
}

async function seedLocations() {
    console.log('\n=== SEEDING LOCATIONS ===');
    try {
        // Seed Tennis Courts
        const tennisData = JSON.parse(
            await fs.readFile(
                path.join(__dirname, 'DPR_Tennis_001.json'),
                'utf8'
            )
        );
        
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

        // Seed Basketball Courts
        const basketballData = JSON.parse(
            await fs.readFile(
                path.join(__dirname, 'DPR_Basketball_001.json'),
                'utf8'
            )
        );

        console.log('Inserting basketball courts...');
        successCount = 0;
        errorCount = 0;

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
        console.log('Locations seeding completed!');
    } catch (e) {
        console.error('Error during location seeding:', e);
        throw e;
    }
}

async function seedUsers() {
    console.log('\n=== SEEDING USERS ===');
    try {
        let locations = await locationMethods.getAllLocations();
        const userData = JSON.parse(
            await fs.readFile(
                path.join(__dirname, 'Sample_Users.json'),
                'utf8'
            )
        );
        console.log('Inserting users...');
        let successCount = 0;
        let errorCount = 0;
        let i = 0;
        for (const user of userData) {
            try {
                    await userMethods.addUser(user.firstName, user.lastName, user.email, user.password, user.isAnonymous, [locations[0]._id.toString(), locations[1]._id.toString(), locations[2]._id.toString(), locations[3]._id.toString(), locations[4]._id.toString(), locations[5]._id.toString(), locations[6]._id.toString()]);
                    successCount++;
            } catch (e) {
                errorCount++;
                console.error(`Error adding user ${user.firstName}: ${e}`);
            }
        }
        console.log(`User seeding completed. Successfully added/updated ${successCount} users. Failed to add ${errorCount} users.`);
        console.log('Users seeding completed!');
    } catch (e) {
        console.error('Error during user seeding:', e);
        throw e;
    }
}

async function seedReviews() {
    console.log('\n=== SEEDING REVIEWS ===');
    try {
        console.log('Inserting reviews...');
        let successCount = 0;
        let errorCount = 0;
        
        let users = await userMethods.getAllUsers();
        let locations = await locationMethods.getAllLocations();
        
        if (!users || users.length === 0) {
            throw 'Failed to get users! Cannot seed reviews.';
        }
        if (!locations || locations.length === 0) {
            throw 'Failed to get locations! Cannot seed reviews.';
        }
        
        const reviewData = [
            {
                "userId": users[0]._id.toString(),
                "locationId": locations[0]._id.toString(),
                "rating": 5,
                "comment": "This park is awesome! I had so much fun!",
                "isReported": true
            },
            {
                "userId": users[4]._id.toString(),
                "locationId": locations[0]._id.toString(),
                "rating": 2.7,
                "comment": "I'm not going to lie, this park has been better. The facilities need to be maintained better.",
                "isReported": false
            },
            {
                "userId": users[8]._id.toString(),
                "locationId": locations[0]._id.toString(),
                "rating": 4.8,
                "comment": "I had a blast playing fun games with my old buddies here! Great time!",
                "isReported": true
            },
            {
                "userId": users[5]._id.toString(),
                "locationId": locations[1]._id.toString(),
                "rating": 3,
                "comment": "This park is just ok.",
                "isReported": false
            },
            {
                "userId": users[9]._id.toString(),
                "locationId": locations[1]._id.toString(),
                "rating": 4,
                "comment": "Great park, but I will say that there is construction currently being done on a number of the courts, so it might not be the best idea to come here right now.",
                "isReported": true
            },
            {
                "userId": users[2]._id.toString(),
                "locationId": locations[1]._id.toString(),
                "rating": 1,
                "comment": "Gosh, it seems like they have been doing construction forever. When will this park finally open back up???!!",
                "isReported": true
            },
            {
                "userId": users[7]._id.toString(),
                "locationId": locations[1]._id.toString(),
                "rating": 3.8,
                "comment": "Some solid facilities at this park! I will say it gets a little too crowded here sometimes, so I prefer to go to other parks during peak weekend hours",
                "isReported": false
            },
            {
                "userId": users[7]._id.toString(),
                "locationId": locations[2]._id.toString(),
                "rating": 1,
                "comment": "This park is falling apart! It's sad to see :(",
                "isReported": false
            },
            {
                "userId": users[2]._id.toString(),
                "locationId": locations[2]._id.toString(),
                "rating": 1.1,
                "comment": "Will this park ever not be closed??? Used to come here all the time with my friends to play a pickup game or two, but it feels like this place is never open.",
                "isReported": true
            },
            {
                "userId": users[8]._id.toString(),
                "locationId": locations[2]._id.toString(),
                "rating": 1.5,
                "comment": "Personally, the worst park I've ever been to. I do not like this place and I am never going here again.",
                "isReported": false
            },
            {
                "userId": users[3]._id.toString(),
                "locationId": locations[3]._id.toString(),
                "rating": 3.5,
                "comment": "A pretty good park! At the basketball court, one of the hoops is currently broken which I thought was worth mentioning. The tennis courts are awesome, though!",
                "isReported": false
            },
            {
                "userId": users[6]._id.toString(),
                "locationId": locations[3]._id.toString(),
                "rating": 4.8,
                "comment": "I've been coming here since I was just a kid, and it never gets old! Me and my friends frequently come here to play games of pickleball. Love it!",
                "isReported": false
            },
            {
                "userId": users[1]._id.toString(),
                "locationId": locations[4]._id.toString(),
                "rating": 2.5,
                "comment": "Eh, I've seen better. The courts need more maintenance work, and there is this one group of teens who are always too rowdy when I am trying to have a peaceful Tuesday afternoon game. Shouldn't they be in school?",
                "isReported": false
            },
            {
                "userId": users[0]._id.toString(),
                "locationId": locations[4]._id.toString(),
                "rating": 2.7,
                "comment": "Would come here so much more often if it wasn't for that group of annoying teenagers causing some sort of trouble. It's getting really aggrevating.",
                "isReported": false
            },


        ];
        
        for (const review of reviewData) {
            try {
                await reviewMethods.addReview(review.userId, review.locationId, review.rating, review.comment, review.isReported);
                successCount++;
            } catch (e) {
                errorCount++;
                console.error(`Error adding review ${review.rating}: ${e}`);
            }
        }
        console.log(`Review seeding completed. Successfully added/updated ${successCount} reviews. Failed to add ${errorCount} reviews.`);
        console.log('Reviews seeding completed!');
    } catch (e) {
        console.error('Error during review seeding:', e);
        throw e;
    }
}

async function seedForums() {
    console.log('\n=== SEEDING FORUM MESSAGES ===');
    try {
        console.log('Inserting forum messages...');
        let successCount = 0;
        let errorCount = 0;
        
        let users = await userMethods.getAllUsers();
        let locations = await locationMethods.getAllLocations();
        
        if (!users || users.length === 0) {
            throw 'Failed to get users! Cannot seed forum messages.';
        }
        if (!locations || locations.length === 0) {
            throw 'Failed to get locations! Cannot seed forum messages.';
        }
        
        const forumData = [
            {
                "locationId": locations[0]._id.toString(),
                "userId": users[0]._id.toString(),
                "content": "This park is awesome! I had so much fun!"
            },
             {
                "locationId": locations[0]._id.toString(),
                "userId": users[1]._id.toString(),
                "content": "Nothing beats a sunny, clear day at this park playing pickleball!"
            },
            {
                "locationId": locations[0]._id.toString(),
                "userId": users[2]._id.toString(),
                "content": "Why is everyone here so good at playing tennis? I need to up my game!"
            },
            {
                "locationId": locations[0]._id.toString(),
                "userId": users[8]._id.toString(),
                "content": "A lot of great food trucks have been coming around this park lately! Yum!"
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
            {
                "locationId": locations[1]._id.toString(),
                "userId": users[4]._id.toString(),
                "content": "I had a fun time today playing tennis at this park! Thanks to all who were part of my game!"
            },
            {
                "locationId": locations[1]._id.toString(),
                "userId": users[8]._id.toString(),
                "content": "I can't wait until the upcoming pickup game this Saturday! I'm gonna score like never before!"
            },
            {
                "locationId": locations[1]._id.toString(),
                "userId": users[3]._id.toString(),
                "content": "You can't beat me at Pickleball. There's just no possible way. Won't happen."
            },
            {
                "locationId": locations[2]._id.toString(),
                "userId": users[7]._id.toString(),
                "content": "Is it just me, or did the basketball hoops get lower? It's getting easier and easier to dunk on all of you!"
            },
            {
                "locationId": locations[2]._id.toString(),
                "userId": users[8]._id.toString(),
                "content": "The best time of day to come to this park is early in the morning. Many of the courts are still open, so you have a lot of space to just enjoy the game with your friends."
            },
             {
                "locationId": locations[2]._id.toString(),
                "userId": users[5]._id.toString(),
                "content": "Can this park stay open a bit later please? Me and my friends like playing basketball late into the night!"
            },
            {
                "locationId": locations[3]._id.toString(),
                "userId": users[5]._id.toString(),
                "content": "Hey all! Looking for a few people to join my pickup game on Thursday. I am not very advanced, so beginner level players are preferred."
            },
            {
                "locationId": locations[3]._id.toString(),
                "userId": users[9]._id.toString(),
                "content": "There is one tennis court where a lot of birds have decided to do their business. This court definitely needs some cleaning!"
            },
            {
                "locationId": locations[4]._id.toString(),
                "userId": users[2]._id.toString(),
                "content": "Wow, this park was really crowded today! I have to say, it makes sense though, because these courts are state-of-the-art!"
            },
            {
                "locationId": locations[4]._id.toString(),
                "userId": users[0]._id.toString(),
                "content": "I tell ya, those teenagers who are always here are really annoying. I want to just play in peace, but they are always causing havoc!"
            },
        ];
        
        for (const comment of forumData) {
            try {
                await forumMethods.createMessage(comment.locationId, comment.userId, comment.content);
                successCount++;
            } catch (e) {
                errorCount++;
                console.error(`Error adding forum message: ${e}`);
            }
        }
        console.log(`Forum seeding completed. Successfully added/updated ${successCount} messages. Failed to add ${errorCount} messages.`);
        console.log('Forum messages seeding completed!');
    } catch (e) {
        console.error('Error during forum seeding:', e);
        throw e;
    }
}

async function seedGames() {
    console.log('\n=== SEEDING GAMES ===');
    try {
        console.log('Inserting games...');
        let successCount = 0;
        let errorCount = 0;
        
        let users = await userMethods.getAllUsers();
        let locations = await locationMethods.getAllLocations();
        
        if (!users || users.length === 0) {
            throw 'Failed to get users! Cannot seed games.';
        }
        if (!locations || locations.length === 0) {
            throw 'Failed to get locations! Cannot seed games.';
        }
        
        // Filter locations to find ones with basketball and tennis facilities
        const basketballLocations = locations.filter(loc => 
            loc.basketball && loc.basketball.numCourts > 0
        );
        const tennisLocations = locations.filter(loc => 
            loc.tennis && loc.tennis.numCourts > 0
        );
        
        // Create array of future dates for games
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const twoWeeks = new Date(today);
        twoWeeks.setDate(twoWeeks.getDate() + 14);

        const gameInfo = [
            // Basketball games
            {
                "userId": users[0]._id.toString(),
                "locationId": basketballLocations.length > 0 ? basketballLocations[0]._id.toString() : locations[0]._id.toString(),
                "startTime": new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0).toISOString(),
                "endTime": new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 0).toISOString(),
                "sport": "basketball",
                "desiredParticipants": 10,
                "courtNumber": Math.ceil(Math.random() * locations[0].facilities.basketball.numCourts),
                "skillLevel": "intermediate"
            },
            {
                "userId": users[1]._id.toString(),
                "locationId": basketballLocations.length > 0 ? basketballLocations[0]._id.toString() : locations[0]._id.toString(),
                "startTime": new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 17, 0).toISOString(),
                "endTime": new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 19, 0).toISOString(),
                "sport": "basketball",
                "desiredParticipants": 8,
                "courtNumber": Math.ceil(Math.random() * locations[0].facilities.basketball.numCourts),
                "skillLevel": "advanced"
            },
            {
                "userId": users[2]._id.toString(),
                "locationId": basketballLocations.length > 1 ? basketballLocations[1]._id.toString() : locations[0]._id.toString(),
                "startTime": new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0).toISOString(),
                "endTime": new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 12, 0).toISOString(),
                "sport": "basketball",
                "desiredParticipants": 6,
                "courtNumber": Math.ceil(Math.random() * locations[1].facilities.basketball.numCourts),
                "skillLevel": "beginner"
            },
            // Tennis games
            {
                "userId": users[3]._id.toString(),
                "locationId": tennisLocations.length > 0 ? tennisLocations[0]._id.toString() : locations[0]._id.toString(),
                "startTime": new Date(twoWeeks.getFullYear(), twoWeeks.getMonth(), twoWeeks.getDate(), 14, 0).toISOString(),
                "endTime": new Date(twoWeeks.getFullYear(), twoWeeks.getMonth(), twoWeeks.getDate(), 16, 0).toISOString(),
                "sport": "tennis",
                "desiredParticipants": 4,
                "courtNumber": Math.ceil(Math.random() * locations[0].facilities.tennis.numCourts),
                "skillLevel": "intermediate"
            },
            {
                "userId": users[4]._id.toString(),
                "locationId": tennisLocations.length > 0 ? tennisLocations[0]._id.toString() : locations[0]._id.toString(),
                "startTime": new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 9, 0).toISOString(),
                "endTime": new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 11, 0).toISOString(),
                "sport": "tennis",
                "courtNumber": Math.ceil(Math.random() * locations[0].facilities.tennis.numCourts),
                "desiredParticipants": 2,
                "skillLevel": "advanced"
            },
            {
                "userId": users[5]._id.toString(),
                "locationId": tennisLocations.length > 1 ? tennisLocations[1]._id.toString() : locations[0]._id.toString(),
                "startTime": new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0).toISOString(),
                "endTime": new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 0).toISOString(),
                "sport": "tennis",
                "desiredParticipants": 4,
                "courtNumber": Math.ceil(Math.random() * locations[1].facilities.tennis.numCourts),
                "skillLevel": "beginner"
            },
            // Additional mixed games
            {
                "userId": users[6]._id.toString(),
                "locationId": basketballLocations.length > 0 ? basketballLocations[0]._id.toString() : locations[0]._id.toString(),
                "startTime": new Date(twoWeeks.getFullYear(), twoWeeks.getMonth(), twoWeeks.getDate(), 12, 0).toISOString(),
                "endTime": new Date(twoWeeks.getFullYear(), twoWeeks.getMonth(), twoWeeks.getDate(), 14, 0).toISOString(),
                "sport": "basketball",
                "desiredParticipants": 12,
                "courtNumber": Math.ceil(Math.random() * locations[0].facilities.basketball.numCourts),
                "skillLevel": "intermediate"
            },
            {
                "userId": users[7]._id.toString(),
                "locationId": tennisLocations.length > 0 ? tennisLocations[0]._id.toString() : locations[0]._id.toString(),
                "startTime": new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 17, 0).toISOString(),
                "endTime": new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 19, 0).toISOString(),
                "sport": "tennis",
                "desiredParticipants": 6,
                "courtNumber": Math.ceil(Math.random() * locations[0].facilities.tennis.numCourts),
                "skillLevel": "beginner"
            }
        ];
        
        for (const game of gameInfo) {
            try {
                await gameData.addGame(
                    game.userId,
                    game.locationId,
                    game.startTime,
                    game.endTime,
                    game.sport,
                    game.desiredParticipants,
                    game.courtNumber,
                    game.skillLevel
                );
                successCount++;
                console.log(`Successfully added ${game.sport} game at location ${game.locationId}`);
            } catch (e) {
                errorCount++;
                console.error(`Error adding game: ${e}`);
            }
        }
        console.log(`Game seeding completed. Successfully added ${successCount} games. Failed to add ${errorCount} games.`);
        console.log('Games seeding completed!');
    } catch (e) {
        console.error('Error during game seeding:', e);
        throw e;
    }
}

async function main() {
    try {
        console.log('Starting database seeding...\n');
        
        //order matters users needs to go first with respect to reviews and forumns 
        await seedLocations();
        await seedUsers();
        await seedReviews();
        await seedForums();
        await seedGames();

        console.log('\nAll seeding completed successfully!');
    } catch (e) {
        console.error('\nError during seeding:', e);
        process.exit(1);
    }
}

main().then(() => {
    console.log('\nDone seeding database');
}).catch((e) => {
    console.error(e);
}).finally(() => {
    console.log('Closing connection to database');
    process.exit(0);
});