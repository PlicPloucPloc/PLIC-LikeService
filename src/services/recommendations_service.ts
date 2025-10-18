import { fetchApartmentCoordinates, fetchApartmentInfo } from "../data/apartments";
import { getCoordinates } from "../data/openstreetmap";
import { checkSimilarityGraph, dropOldRelationsGraph, generateRelationsGraph, generateSimilarityGraph, getSimilarUsers } from "../data/recommendations";
import { cacheRecommendedApartments, popCachedApartment } from "../data/redis_cache";
import { fetchApartmentNoRelations, fetchApartmentWithZeroRelations, getRelationsUnpaginated } from "../data/relations";
import { apartment_info } from "../models/apartment_info";
import { coordinates } from "../models/coordinates";
import { filters } from "../models/filters";
import { getAllLikes } from "./like_service";

export async function generateRecommendations(): Promise<void> {
    try {
        await dropOldRelationsGraph();
        await generateRelationsGraph();
        await generateSimilarityGraph();
    } catch (err: any) {
        console.error('Failed to generate recommendations: ', err.cause);
        throw err;
    }
}

export async function fetchSimilarUsers(id: string): Promise<string[]> {
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
    var count = 0;
    var recommendedApts : string[] = [];
    if (users.length !== 0) {
        var previousZeroRelAptsCount: number = 0;
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

export function getDistance(origin: coordinates , destination: coordinates): number {
    const R = 6371; // Radius of the earth in km

    // Convert degrees to radians
    const toRad = (value: number) => (value * Math.PI) / 180;
    var lat1: number = toRad(origin.lat);
    var lon1: number = toRad(origin.lon);
    var lat2 = toRad(destination.lat);
    var lon2 = toRad(destination.lon);
    
    // Calculate distance using Haversine formula
    const dLat = Math.pow(Math.sin((lat2 - lat1)/2), 2);
    const dLon = Math.pow(Math.sin((lon2 - lon1)/2), 2);
    const dist = R * 2 * Math.asin(Math.sqrt(dLat + Math.cos(lat1) * Math.cos(lat2) * dLon));
    return dist;
}

async function filterApartments(bearer: string,
                                aptId: number,
                                destination: coordinates,
                                rent: number,
                                surface: number,
                                is_furnished: boolean): Promise<number> {
    var aptInfo: apartment_info = await fetchApartmentInfo(bearer, aptId);
    var origin: coordinates = await fetchApartmentCoordinates(bearer, aptId);
    var dist: number = getDistance(origin, destination);
    if (dist > 30 || aptInfo.rent > rent || aptInfo.surface < surface || aptInfo.is_furnished != is_furnished) {
        console.log('Apartment ', aptId, ' does not match user preferences. Filtering out.');
        return -1;
    }
    return aptId;
}

export async function getRecommendedApartments(bearer: string, userId: string, limit: number, filters: filters,firstId: number = -1): Promise<{aptIds: number[]}> {
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
    if (recommendedApts.includes(firstId)){
        return { aptIds: [] };
    }
    var firstRecId: number = recommendedApts[0];
    var filterAptsPromises: Promise<number>[] = [];
    var destination: coordinates = await getCoordinates(filters.location);
    recommendedApts.forEach((apt) => {
        filterAptsPromises.push(filterApartments(bearer, apt,destination,filters.rent,filters.size, filters.is_furnished));
    });
    recommendedApts = await Promise.all(filterAptsPromises).then((results) => results.filter((aptId) => aptId != -1));
    if (recommendedApts.length < limit) {
        var ret = await getRecommendedApartments(bearer, userId, limit - recommendedApts.length, filters, firstId == -1 ? firstRecId : firstId);
        recommendedApts = recommendedApts.concat(ret.aptIds);
    }
    console.log("Final recommended apartments: ", recommendedApts);
    return {aptIds: recommendedApts};
}
