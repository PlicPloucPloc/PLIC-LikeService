import { Logger } from "winston";
import { checkSimilarityGraph, dropOldRelationsGraph, generateRelationsGraph, generateSimilarityGraph, getSimilarUsers, getSimilarUsersColloc, orderByProximity } from "../data/recommendations";
import { fetchApartmentWithZeroRelations } from "../data/relations";
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

export async function getRecommendedColloc(userId: string, skip: number, limit: number): Promise<string[]> {
    if (await checkSimilarityGraph()){
            logger.info('Similarity graph does not exist. Generating recommendations graph.');
        await generateRecommendations();
    }
    let recommendedColloc = await getSimilarUsersColloc(userId, skip, limit);
    return recommendedColloc.map(record => record.get('Person2'))
}

export async function orderAptIds(aptIds: number[], userId: string): Promise<Response> {
    const apt_info: number[] = await orderByProximity(aptIds, userId);
    return handleResponse(JSON.stringify(apt_info), 200);
}
