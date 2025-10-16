import { checkSimilarityGraph, dropOldRelationsGraph, generateRelationsGraph, generateSimilarityGraph, getSimilarUsers } from "../data/recommendations";
import { cacheRecommendedApartments, popCachedApartment } from "../data/redis_cache";
import { fetchApartmentNoRelations, fetchApartmentWithZeroRelations, getRelationsUnpaginated } from "../data/relations";
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
    var previousZeroRelAptsCount: number = 0;
    var count = 0;
    const aptRel : string[] = (await getRelationsUnpaginated(userId)).map((rel) => rel.get('a').properties.id);
    console.log('Apartments already related to user: ', aptRel);
    for (const user of users) {
        try {
            console.log('Fetching likes for similar user: ', user);
            const apartments = await getAllLikes(bearer, user, 0, 10);
            console.log('Likes found');
            var aptsAdded: number = 0;
            apartments.forEach((apt) => {
                const aptId = apt.apt.apartment_id.toString();
                if (!recommendedApts.includes(aptId) && !aptRel.includes(aptId)){
                    aptsAdded++;
                    recommendedApts.push(aptId);
                    console.log('Added apartment to recommendations: ', aptId);
                }
            });
            if (aptsAdded < 10) {
                (await fetchApartmentWithZeroRelations(previousZeroRelAptsCount,10 - aptsAdded))
                    .map((apt) => recommendedApts.push(apt.get('a').properties.id));
            }
            previousZeroRelAptsCount += (10 - aptsAdded);
            count+=10;
        } catch (err: any) {
            console.error('Failed to fetch likes for user ', user, ': ', err.cause);
        }
    }
    (await fetchApartmentNoRelations(userId, 0,100-count))
        .map((apt) => {
            if (!recommendedApts.includes(apt.get('a').properties.id)){
                recommendedApts.push(apt.get('a').properties.id)
            }
        });
    
    console.log('Caching recommended apartments: ', recommendedApts);
    cacheRecommendedApartments(userId, recommendedApts);
    return true;
}

async function getRedisApts(userId: string, limit: number): Promise<number[]> {
    let recommendedApts = [];
    for (let i = 0; i < limit; i++){
        let recommendedApt: number|null = await popCachedApartment(userId);
        console.log('Popped cached recommendation: ', recommendedApt);
        if (!recommendedApt) {
            console.log('No more cached recommendations available.');
            break;
        }
        recommendedApts.push(recommendedApt);
    }
    return recommendedApts;
}

async function getRecommendedApartments(bearer: string, userId: string, limit: number): Promise<{aptIds: number[]}> {
    console.log('Fetching recommended apartments for user: ', userId);
    let recommendedApts: number[] = await getRedisApts(userId, limit);
    if (recommendedApts.length < limit) {
        if ((await checkSimilarityGraph()) == false) {
            console.log('Similarity graph does not exist. Generating recommendations graph.');
            await generateRecommendations();
        }

        console.log('No cached recommendations found, generating new ones.');
        await generateRecommendedApartmentsList(bearer, userId);
        recommendedApts = await getRedisApts(userId, limit);
    }
    console.log('Recommended apartments: ', recommendedApts);
    return {aptIds: recommendedApts};
}
export { generateRecommendations, fetchSimilarUsers, getRecommendedApartments };
