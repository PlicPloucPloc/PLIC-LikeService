import { dropOldRelationsGraph, generateRelationsGraph, generateSimilarityGraph, getSimilarUsers } from "../data/recommendations";
import { cacheRecommendedApartments, popCachedApartment } from "../data/redis_cache";
import { fetchApartmentWithZeroRelations, getRelationsUnpaginated } from "../data/relations";
import { getAllLikes } from "./like_service";

async function generateRecommendations(): Promise<void> {
    try {
        await dropOldRelationsGraph();
        await generateRelationsGraph();
        await generateSimilarityGraph();
    } catch (err: any) {
        console.error('Failed to generate recommendations: ', err.cause);
        throw err;
    }
}

async function fetchSimilarUsers(id: string): Promise<string[]> {
    try {
        const records = await getSimilarUsers(id);
        return records.map(record => record.get('Person2'));
    } catch (err: any) {
        console.error('Failed to fetch similar users: ', err.cause);
        throw err;
    }
}

async function generateRecommendedApartmentsList(bearer: string, userId: string) : Promise<boolean> {
    console.log('Generating recommended apartments for user: ', userId);
    const similarUsers = await getSimilarUsers(userId);
    console.log('Similar users found: ', similarUsers.length);
    const users = similarUsers.map((record) => record.get('Person2'));
    if (users.length == 0) {
        console.log('Similar users not found')
        return false;
    }
    var recommendedApts : string[] = [];
    var count : number = 0;
    const aptRel : string[] = (await getRelationsUnpaginated(userId)).map((rel) => rel.get('a').properties.id);
    console.log('Apartments already related to user: ', aptRel);
    for (const user of users) {
        try {
            console.log('Fetching likes for similar user: ', user);
            const apartments = await getAllLikes(bearer, user, 0, 10);
            console.log('Likes found');
            apartments.forEach((apt) => {
                const aptId = apt.apt.apartment_id.toString();
                if (!recommendedApts.includes(aptId) && !aptRel.includes(aptId)){
                    recommendedApts.push(aptId);
                    console.log('Added apartment to recommendations: ', aptId);
                }
            });
            if ( count == 9 ) {
                break;
            } 
            count++;
        } catch (err: any) {
            console.error('Failed to fetch likes for user ', user, ': ', err.cause);
        }
    }
    console.log('Caching recommended apartments: ', recommendedApts);
    cacheRecommendedApartments(userId, recommendedApts);
    return true;
}

async function getRecommendedApartments(bearer: string, userId: string, limit: number): Promise<{aptIds: number[]}> {
    console.log('Fetching recommended apartments for user: ', userId);
    let recommendedApt : number|null = await popCachedApartment(userId);
    console.log('Popped cached recommendation: ', recommendedApt);
    let recommendedApts = [];
    if (!recommendedApt) {
        console.log('No cached recommendations found, generating new ones.');
        await generateRecommendedApartmentsList(bearer, userId);
    }
    else {
        recommendedApts.push(recommendedApt);
    }
    console.log('Generated new recommendations, fetching from cache.');
    for (let i = 0; i < limit-1; i++){
        recommendedApt = await popCachedApartment(userId);
        console.log('Popped cached recommendation: ', recommendedApt);
        if (!recommendedApt) {
            console.log('No more cached recommendations available.');
            break;
        }
        recommendedApts.push(recommendedApt);
    }
    if (recommendedApts.length < limit) {
        const zeroRelationsApts : number[] = (await fetchApartmentWithZeroRelations(0,limit - recommendedApts.length)).map((apt) => apt.get('a').properties.id);
        recommendedApts.push.apply(recommendedApts, zeroRelationsApts);
    }
    console.log('Recommended apartments: ', recommendedApts);
    return {aptIds: recommendedApts};
}
export { generateRecommendations, fetchSimilarUsers, getRecommendedApartments };
