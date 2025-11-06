import { Logger } from "winston";
import { checkSimilarityGraph, dropOldRelationsGraph, generateRelationsGraph, generateSimilarityGraph, getSimilarUsers, getSimilarUsersColloc, orderByProximity } from "../data/recommendations";
import { cacheRecommendedApartments, popCachedApartment } from "../data/redis_cache";
import { fetchApartmentNoRelations, fetchApartmentWithZeroRelations, getRelationsUnpaginated } from "../data/relations";
import { getLogger } from "./logger";
import { getAllLikes } from "./likeService";
import { relation } from "../models/relation";
import { handleResponse } from "./responseService";

const logger: Logger = getLogger('Recommendation');

export async function generateRecommendations(): Promise<void> {
        await dropOldRelationsGraph();
        await generateRelationsGraph();
        await generateSimilarityGraph();
}

export async function fetchSimilarUsers(id: string): Promise<string[]> {
        const records = await getSimilarUsers(id);
        return records.map(record => record.get('Person2'));
}

async function getUserLikes(user: string, recommendedApts: string[], aptRel: string[], bearer: string, previousZeroRelAptsCount: number): Promise<string[]>{
        logger.info(`Fetching likes for similar user: ${user}`);
        const apartments: relation[] = await getAllLikes(bearer, user, 0, 10);
        logger.info('Likes found');
        var aptsAdded: number = 0;
        apartments.forEach((apt) => {
            const aptId = apt.apt.apartment_id.toString();
            if (!recommendedApts.includes(aptId) && !aptRel.includes(aptId)){
                aptsAdded++;
                recommendedApts.push(aptId);
                logger.info(`Added apartment to recommendations: ${aptId}`);
            }
        });
        if (aptsAdded < 10) {
            (await fetchApartmentWithZeroRelations(previousZeroRelAptsCount,10 - aptsAdded))
            .map((apt) => recommendedApts.push(apt.get('a').properties.id));
        }
        previousZeroRelAptsCount += (10 - aptsAdded);
        return recommendedApts;
}

async function generateRecommendedApartmentsList(bearer: string, userId: string) : Promise<boolean> {
    logger.info(`Generating recommended apartments for user: ${userId}`);
    const similarUsers = await getSimilarUsers(userId);
    logger.info(`Similar users found: ${similarUsers}`);
    const users = similarUsers.map((record) => record.get('Person2'));
    var count = 0;
    var recommendedApts : string[] = [];
    if (users.length !== 0) {
        var previousZeroRelAptsCount: number = 0;
        const aptRel : string[] = (await getRelationsUnpaginated(userId)).map((rel) => rel.get('a').properties.id);
        logger.info(`Apartments already related to user: ${aptRel}`);
        for (const user of users) {
            try {
                recommendedApts = await getUserLikes(user, recommendedApts, aptRel, bearer, previousZeroRelAptsCount);
                count+=10;
            } catch (err: any) {
                logger.error(`Failed to fetch likes for user ${user} : ${err.cause}`);
            }
        }
    }
    (await fetchApartmentNoRelations(userId, 0,100-count))
    .map((apt) => {
        if (!recommendedApts.includes(apt.get('a').properties.id)){
            recommendedApts.push(apt.get('a').properties.id)
        }
    });

    logger.info(`Caching recommended apartments: ${recommendedApts}`);
    cacheRecommendedApartments(userId, recommendedApts);
    return true;
}

async function getRedisApts(userId: string, limit: number): Promise<number[]> {
    let recommendedApts: number[] = [];
    for (let i = 0; i < limit; i++){
        let recommendedApt: number|null = await popCachedApartment(userId);
        logger.info(`Popped cached recommendation: ${recommendedApt}`);
        if (!recommendedApt) {
            logger.info('No more cached recommendations available.');
            break;
        }
        recommendedApts.push(recommendedApt);
    }
    return recommendedApts;
}


export async function getRecommendedApartments(bearer: string, userId: string, limit: number): Promise<number[]> {
    logger.info(`Fetching recommended apartments for user: ${userId}`);
    let recommendedApts: number[] = await getRedisApts(userId, limit);
    if (recommendedApts.length < limit) {
        if ((await checkSimilarityGraph()) == false) {
            logger.info('Similarity graph does not exist. Generating recommendations graph.');
            await generateRecommendations();
        }

        logger.info('No cached recommendations found, generating new ones.');
        await generateRecommendedApartmentsList(bearer, userId);
        recommendedApts = await getRedisApts(userId, limit);
    }
    logger.info(`Final recommended apartments: ${recommendedApts}`);
    return recommendedApts;
}

export async function getRecommendedColloc(userId: string, skip: number, limit: number): Promise<string[]> {
    let recommendedColloc = await getSimilarUsersColloc(userId, skip, limit);
    return recommendedColloc.map(record => record.get('Person2'))
}

export async function orderAptIds(aptIds: number[], userId: string): Promise<Response> {
    const apt_info: number[] = await orderByProximity(aptIds, userId);
    return handleResponse(JSON.stringify(apt_info), 200);
}
