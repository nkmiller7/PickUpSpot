import { locations } from "../config/mongoCollections.js";
import validation from './validation.js';
import { ObjectId } from 'mongodb';

const exportedMethods = {
    async getAllLocations() {
        const locationCollection = await locations();
        const locationList = await locationCollection.find({}).toArray();
        return locationList;
    },

    async getLocationById(id) {
        id = validation.checkId(id);
        const locationCollection = await locations();
        const location = await locationCollection.findOne({ _id: new ObjectId(id) });
        if (!location) throw 'Error: Location not found';
        return location;
    },

    async createOrUpdateLocation(locationData) {
        const propId = validation.checkString(locationData.propId, 'Property ID');
        const name = validation.checkString(locationData.name, 'Name');
        const location = validation.checkString(locationData.location, 'Location');

        // optional fields
        const phone = locationData.phone ? validation.checkString(locationData.phone, 'Phone') : null;
        const info = locationData.info ? validation.checkString(locationData.info, 'Info') : null;
        const lat = locationData.lat ? parseFloat(locationData.lat) : null;
        const lon = locationData.lon ? parseFloat(locationData.lon) : null;

        const locationCollection = await locations();

        // Check to see if a location with this propId already exists (means it is at same park/location)
        const existingLocation = await locationCollection.findOne({ propId: propId });

        if (existingLocation) {
            const updateData = {
                name: name,
                location: location,
                phone: phone || existingLocation.phone,
                info: info || existingLocation.info,
                location: {
                    address: location,
                    coordinates: (lat && lon) ? {
                        lat: lat,
                        lon: lon
                    } : existingLocation.location.coordinates
                }
            };

            const facilities = {
                tennis: existingLocation.facilities.tennis,
                basketball: existingLocation.facilities.basketball
            };

            if (locationData.tennis) {
                const tennisCourts = locationData.tennis.numCourts ? validation.checkNumber(locationData.tennis.numCourts, 'Tennis Courts') : null;
                const tennisType = locationData.tennis.surfaceType ? validation.checkString(locationData.tennis.surfaceType, 'Tennis Type') : null;
                const tennisIndoorOutdoor = locationData.tennis.indoorOutdoor ? validation.checkString(locationData.tennis.indoorOutdoor, 'Indoor/Outdoor') : null;
                
                facilities.tennis = {
                    numCourts: tennisCourts ? parseInt(tennisCourts) : null,
                    indoorOutdoor: tennisIndoorOutdoor,
                    surfaceType: tennisType,
                    accessible: locationData.tennis.accessible === 'Y'
                };
            }

            if (locationData.basketball) {
                const basketballCourts = locationData.basketball.numCourts ? validation.checkNumber(locationData.basketball.numCourts, 'Basketball Courts') : null;
                const basketballIndoorOutdoor = locationData.basketball.indoorOutdoor ? validation.checkString(locationData.basketball.indoorOutdoor, 'Indoor/Outdoor') : null;
                
                facilities.basketball = {
                    numCourts: basketballCourts ? parseInt(basketballCourts) : 1,
                    indoorOutdoor: basketballIndoorOutdoor,
                    accessible: locationData.basketball.accessible === 'Y'
                };
            }

            updateData.facilities = facilities;

            const updateInfo = await locationCollection.updateOne(
                { propId: propId },
                { $set: updateData }
            );
            
            if (!updateInfo.acknowledged) throw 'Could not update location';
            return await locationCollection.findOne({ propId: propId });
        } else {
            const newLocation = {
                propId: propId,
                name: name,
                location: location,
                phone: phone,
                facilities: {
                    tennis: locationData.tennis ? {
                        numCourts: locationData.tennis.numCourts ? validation.checkNumber(locationData.tennis.numCourts, 'Tennis Courts') : null,
                        indoorOutdoor: locationData.tennis.indoorOutdoor ? validation.checkString(locationData.tennis.indoorOutdoor, 'Indoor/Outdoor') : null,
                        surfaceType: locationData.tennis.surfaceType ? validation.checkString(locationData.tennis.surfaceType, 'Tennis Type') : null,
                        accessible: locationData.tennis.accessible === 'Y'
                    } : null,
                    basketball: locationData.basketball ? {
                        numCourts: locationData.basketball.numCourts ? validation.checkNumber(locationData.basketball.numCourts, 'Basketball Courts') : 1,
                        indoorOutdoor: locationData.basketball.indoorOutdoor ? validation.checkString(locationData.basketball.indoorOutdoor, 'Indoor/Outdoor') : null,
                        accessible: locationData.basketball.accessible === 'Y'
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

            const insertInfo = await locationCollection.insertOne(newLocation);
            if (!insertInfo.acknowledged) throw 'Could not add location';
            return await this.getLocationById(insertInfo.insertedId.toString());
        }
    },

    async getLocationsByFacilityType(facilityType) {
        validation.checkString(facilityType, 'Facility Type');
        if (!['tennis', 'basketball'].includes(facilityType.toLowerCase())) {
        throw 'Invalid facility type. Must be either "tennis" or "basketball"';
        }

        const locationCollection = await locations();
        const query = {};
        query['facilities.' + facilityType] = { $ne: null };
        const locations = await locationCollection.find(query).toArray();
        return locations;
    },

    async searchLocationsByCoordinates(lat, lon, radiusInMiles = 5) {
        const latitude = validation.checkNumber(lat, 'Latitude');
        const longitude = validation.checkNumber(lon, 'Longitude');
        
        // Basic validation for valid lat/lon ranges
        if (latitude < -90 || latitude > 90) throw 'Error: Latitude must be between -90 and 90';
        if (longitude < -180 || longitude > 180) throw 'Error: Longitude must be between -180 and 180';

        const locationCollection = await locations();
        return await locationCollection.find({
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