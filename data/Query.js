import { locationData } from './index.js';


/* searchLocation - Takes in search parameters based on a location document.
Filters Location Collection  based on  the provided parameters.
Returns an array of location documents that match the search criteria.
*/
export const searchLocation = async (
    searchTerm = null,
    sport = 'all',
    accessible = null,
    courtType = null,
    indoorOutdoor = null
    ) => {

    try {
        // We will just continiously keep filtering results based on the provided parameters
        let results = await locationData.getAllLocations();


        // Filter by name against the searchBox entry term
        if (searchTerm && typeof searchTerm === 'string') {
            const searchTermLower = searchTerm.toLowerCase().trim();
            results = results.filter(location =>
                location.name && location.name.toLowerCase().includes(searchTermLower)
            );
        }

        // Filter location by sport
        if (sport && sport !== 'all') {
            results = results.filter(location => {
                if (sport === 'tennis') {
                    return location.facilities?.tennis;
                } else if (sport === 'basketball') {
                    return location.facilities?.basketball;
                }
                return true;
            });
        }

        // Specifically filter tennis court type
        if (courtType) {
            results = results.filter(location => {
                if (sport === 'all') {
                    return location.facilities?.tennis?.surfaceType?.toLowerCase() === courtType.toLowerCase();
                }
                else if (sport === 'tennis') {
                    return location.facilities?.tennis?.surfaceType?.toLowerCase() === courtType.toLowerCase();
                }
                return true;
            });
        }

        // Filter for indoor/outdoor
        if (indoorOutdoor) {
            results = results.filter(location => {
                if (sport === 'all') {
                    const tennisMatch = location.facilities?.tennis?.indoorOutdoor?.toLowerCase() === indoorOutdoor.toLowerCase();
                    const basketballMatch = location.facilities?.basketball?.indoorOutdoor?.toLowerCase() === indoorOutdoor.toLowerCase();
                    return tennisMatch || basketballMatch;
                }
                else if (sport === 'tennis') {
                    return location.facilities?.tennis?.indoorOutdoor?.toLowerCase() === indoorOutdoor.toLowerCase();
                } 
                else if (sport === 'basketball') {
                    return location.facilities?.basketball?.indoorOutdoor?.toLowerCase() === indoorOutdoor.toLowerCase();
                }
                return true;
            });
        }

        // Filter by accessibility
        if (accessible !== null) {
            results = results.filter(location => {
                const tennisAccessible = location.facilities?.tennis?.accessible === true;
                const basketballAccessible = location.facilities?.basketball?.accessible === true;
                
                if (sport === 'all') {
                    const isAccessible = tennisAccessible || basketballAccessible;
                    if (accessible) {
                        return isAccessible;
                    } else {
                        return !isAccessible;
                    }
                }
                else if (sport === 'tennis') {
                    if (accessible) {
                        return tennisAccessible;
                    } else {
                        return !tennisAccessible;
                    }
                }
                else if (sport === 'basketball') {
                    if (accessible) {
                        return basketballAccessible;
                    } else {
                        return !basketballAccessible;
                    }
                }
                
                return true;
            });
        }

        return results;

    } catch (error) {
        throw new Error(`Search failed: ${error.message}`);
    }
};
