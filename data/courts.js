import { courts } from "../config/mongoCollections.js";
import validation from './validation.js';
import { ObjectId } from 'mongodb';

const exportedMethods = {
    async getAllCourts() {
        const courtCollection = await courts();
        const courtList = await courtCollection.find({}).toArray();
        return courtList;
    },

    async getCourtById(id) {
        id = validation.checkId(id);
        const courtCollection = await courts();
        const court = await courtCollection.findOne({ _id: new ObjectId(id) });
        if (!court) throw 'Error: Court not found';
        return court;
    },

    async createOrUpdateCourt(courtData) {
        const propId = validation.checkString(courtData.propId, 'Property ID');
        const name = validation.checkString(courtData.name, 'Name');
        const location = validation.checkString(courtData.location, 'Location');

        // optional fields
        const phone = courtData.phone ? validation.checkString(courtData.phone, 'Phone') : null;
        const info = courtData.info ? validation.checkString(courtData.info, 'Info') : null;
        const lat = courtData.lat ? parseFloat(courtData.lat) : null;
        const lon = courtData.lon ? parseFloat(courtData.lon) : null;
        
        const courtCollection = await courts();
        
        // Check to see if a court with this propId already exists (means it is at same park/location)
        const existingCourt = await courtCollection.findOne({ propId: propId });
        
        if (existingCourt) {
            const updateData = {
                name: name,
                location: location,
                phone: phone || existingCourt.phone,
                info: info || existingCourt.info,
                location: {
                    address: location,
                    coordinates: (lat && lon) ? {
                        lat: lat,
                        lon: lon
                    } : existingCourt.location.coordinates
                }
            };

            const facilities = {
                tennis: existingCourt.facilities.tennis,
                basketball: existingCourt.facilities.basketball
            };

            if (courtData.tennis) {
                const tennisCourts = courtData.tennis.numCourts ? validation.checkNumber(courtData.tennis.numCourts, 'Tennis Courts') : null;
                const tennisType = courtData.tennis.surfaceType ? validation.checkString(courtData.tennis.surfaceType, 'Tennis Type') : null;
                const tennisIndoorOutdoor = courtData.tennis.indoorOutdoor ? validation.checkString(courtData.tennis.indoorOutdoor, 'Indoor/Outdoor') : null;
                
                facilities.tennis = {
                    numCourts: tennisCourts ? parseInt(tennisCourts) : null,
                    indoorOutdoor: tennisIndoorOutdoor,
                    surfaceType: tennisType,
                    accessible: courtData.tennis.accessible === 'Y'
                };
            }

            if (courtData.basketball) {
                const basketballCourts = courtData.basketball.numCourts ? validation.checkNumber(courtData.basketball.numCourts, 'Basketball Courts') : null;
                const basketballIndoorOutdoor = courtData.basketball.indoorOutdoor ? validation.checkString(courtData.basketball.indoorOutdoor, 'Indoor/Outdoor') : null;
                
                facilities.basketball = {
                    numCourts: basketballCourts ? parseInt(basketballCourts) : 1,
                    indoorOutdoor: basketballIndoorOutdoor,
                    accessible: courtData.basketball.accessible === 'Y'
                };
            }

            updateData.facilities = facilities;

            const updateInfo = await courtCollection.updateOne(
                { propId: propId },
                { $set: updateData }
            );
            
            if (!updateInfo.acknowledged) throw 'Could not update court';
            return await courtCollection.findOne({ propId: propId });
        } else {
            const newCourt = {
                propId: propId,
                name: name,
                location: location,
                phone: phone,
                facilities: {
                    tennis: courtData.tennis ? {
                        numCourts: courtData.tennis.numCourts ? validation.checkNumber(courtData.tennis.numCourts, 'Tennis Courts') : null,
                        indoorOutdoor: courtData.tennis.indoorOutdoor ? validation.checkString(courtData.tennis.indoorOutdoor, 'Indoor/Outdoor') : null,
                        surfaceType: courtData.tennis.surfaceType ? validation.checkString(courtData.tennis.surfaceType, 'Tennis Type') : null,
                        accessible: courtData.tennis.accessible === 'Y'
                    } : null,
                    basketball: courtData.basketball ? {
                        numCourts: courtData.basketball.numCourts ? validation.checkNumber(courtData.basketball.numCourts, 'Basketball Courts') : 1,
                        indoorOutdoor: courtData.basketball.indoorOutdoor ? validation.checkString(courtData.basketball.indoorOutdoor, 'Indoor/Outdoor') : null,
                        accessible: courtData.basketball.accessible === 'Y'
                    } : null
                },
                info: info,
                location: {
                    address: location,
                    coordinates: (lat && lon) ? {
                        lat: parseFloat(lat),
                        lon: parseFloat(lon)
                    } : null
                }
            };

            const insertInfo = await courtCollection.insertOne(newCourt);
            if (!insertInfo.acknowledged) throw 'Could not add court';
            return await this.getCourtById(insertInfo.insertedId.toString());
        }
    },

    async getCourtsByFacilityType(facilityType) {
        validation.checkString(facilityType, 'Facility Type');
        if (!['tennis', 'basketball'].includes(facilityType.toLowerCase())) {
        throw 'Invalid facility type. Must be either "tennis" or "basketball"';
        }

        const courtCollection = await courts();
        const query = {};
        query['facilities.' + facilityType] = { $ne: null };
        const courts = await courtCollection.find(query).toArray();
        return courts;
    },

    async searchCourtsByLocation(lat, lon, radiusInMiles = 5) {
        const latitude = validation.checkNumber(lat, 'Latitude');
        const longitude = validation.checkNumber(lon, 'Longitude');
        
        // Basic validation for valid lat/lon ranges
        if (latitude < -90 || latitude > 90) throw 'Error: Latitude must be between -90 and 90';
        if (longitude < -180 || longitude > 180) throw 'Error: Longitude must be between -180 and 180';
        
        const courtCollection = await courts();
        return await courtCollection.find({
        'location.coordinates': {
            $ne: null,
            $near: {
            $geometry: {
                type: "Point",
                coordinates: [longitude, latitude]
            },
            $maxDistance: radiusInMiles * 1609.34
            }
        }
        }).toArray();
    }
};

export default exportedMethods;