import { Logger } from "winston";
import { checkSimilarityGraph, dropOldRelationsGraph, generateRelationsGraph, generateSimilarityGraph, getSimilarUsers, getSimilarUsersColloc, orderByProximity } from "../data/recommendations";
import { getLogger } from "./logger";
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

export async function getRecommendedColloc(userId: string, skip: number, limit: number): Promise<string[]> {
    if (!await checkSimilarityGraph()){
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
