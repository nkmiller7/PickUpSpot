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
        if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
            const searchTermLower = searchTerm.toLowerCase().trim();
            results = results.filter(location =>
                location.name && location.name.toLowerCase().includes(searchTermLower)
            );
        }

        // Filter location by sport
        if (sport && sport !== 'all' && sport.trim()) {
            results = results.filter(location => {
                if (sport === 'tennis') {
                    return location.facilities?.tennis;
                } else if (sport === 'basketball') {
                    return location.facilities?.basketball;
                }
                return true;
            });
        }

        // Specifically filter tennis court type (basketball doesn't have surface types)
        if (courtType && courtType.trim()) {
            results = results.filter(location => {
                if (sport === 'all' || sport === null) {
                    return location.facilities?.tennis?.surfaceType?.toLowerCase() === courtType.toLowerCase();
                }
                else if (sport === 'tennis') {
                    return location.facilities?.tennis?.surfaceType?.toLowerCase() === courtType.toLowerCase();
                }
                else if (sport === 'basketball') {
                    return true; 
                }
                return false;
            });
        }

        // Filter for indoor/outdoor
        if (indoorOutdoor && indoorOutdoor.trim()) {
            results = results.filter(location => {
                if (sport === 'all' || sport === null) {
                    const tennisMatch = location.facilities?.tennis?.indoorOutdoor?.toLowerCase() === indoorOutdoor.toLowerCase();
                    const basketballMatch = location.facilities?.basketball?.indoorOutdoor?.toLowerCase() === indoorOutdoor.toLowerCase();
                    return tennisMatch || basketballMatch;
                }
                else if (sport === 'tennis') {
                    return location.facilities?.tennis?.indoorOutdoor?.toLowerCase() === indoorOutdoor.toLowerCase();
                } 
                else if (sport === 'basketball') {
                    const basketballIndoorOutdoor = location.facilities?.basketball?.indoorOutdoor;
                    return basketballIndoorOutdoor && basketballIndoorOutdoor.toLowerCase() === indoorOutdoor.toLowerCase();
                }
                return false;
            });
        }

        // Filter by accessibility 
        if (accessible === true) {
            results = results.filter(location => {
                if (sport === 'all' || sport === null) {
                    const tennisAccessible = location.facilities?.tennis?.accessible === true;
                    const basketballAccessible = location.facilities?.basketball?.accessible === true;
                    return tennisAccessible || basketballAccessible;
                }
                else if (sport === 'tennis') {
                    return location.facilities?.tennis?.accessible === true;
                }
                else if (sport === 'basketball') {
                    return location.facilities?.basketball?.accessible === true;
                }
                
                return false;
            });
        }

        return results;

    } catch (error) {
        throw new Error(`Search failed: ${error.message}`);
    }
};
