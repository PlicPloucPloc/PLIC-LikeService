import { dropOldRelationsGraph, generateRelationsGraph, generateSimilarityGraph, getSimilarUsers } from "../data/recommendations";

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

export { generateRecommendations, fetchSimilarUsers };
