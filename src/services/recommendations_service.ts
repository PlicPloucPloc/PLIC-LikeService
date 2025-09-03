import { dropOldRelationsGraph, generateRelationsGraph, generateSimilarityGraph } from "../data/recommendations";

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

export { generateRecommendations };
