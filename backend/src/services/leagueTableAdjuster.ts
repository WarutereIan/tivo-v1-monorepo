/**
 * Table stored sorted in memory with all the details:
 * How? Get all the values in 'points' field (for each team document in db store points, goals, w,d,l,gd)and store in an array
 * Sort the array from largest to smallest
 * For each array position in the new sorted array fill in object with the corresponding details of the team from the db Team.findOne(points)
 * That way we get sorted league array
 * 
 * League positions are recalculated after every round, objects sorted, stored in memory...and one league doc for this sorted table. Can be stored in cache..
 *
 *  
 */

export const arrangeLeagueTable = async () => {
    
}