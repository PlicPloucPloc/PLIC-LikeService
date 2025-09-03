import { driver } from '../libs/neo4j';

async function generateRelationsGraph(): Promise<any[]> {
    try {
        const { records } = await driver.executeQuery(
            "MATCH (source:Person) OPTIONAL MATCH (source)-[r:LIKED]->(target:Apartment) RETURN gds.graph.project( 'relationsGraph', source, target, { relationshipProperties: r { strength: coalesce(r.strength, 1.0) } })"
        );

        return records;
    } catch (err: any) {
        console.error('Failed to generate relation graph: ', err.cause);
        throw err;
    }
}

async function generateSimilarityGraph(): Promise<any[]> {
    try {
        const { records } = await driver.executeQuery(
            "CALL gds.nodeSimilarity.write.estimate('relationsGraph', {writeRelationshipType: 'SIMILAR', writeProperty: 'score'}) YIELD nodeCount, relationshipCount, bytesMin, bytesMax, requiredMemory"
        );

        return records;
    } catch (err: any) {
        console.error('Failed to generate similarity graph: ', err.cause);
        throw err;
    }
}

async function getSimilarUsers(id: string) {
    try {
        const { records } = await driver.executeQuery(
            `CALL gds.nodeSimilarity.stream('relationsGraph') YIELD node1, node2, similarity WHERE gds.util.asNode(node1).id = ${id} RETURN gds.util.asNode(node1).name AS Person1, gds.util.asNode(node2).name AS Person2, similarity ORDER BY similarity DESCENDING, Person1, Person2 LIMIT 10`
        );

        return records;
    } catch (err: any) {
        console.error('Failed to get similar users: ', err.cause);
        throw err;
    }
}

async function dropOldRelationsGraph(): Promise<void> {
    try {
        await driver.executeQuery(
            "CALL gds.graph.drop('relationsGraph',false) YIELD graphName"
        );
    } catch (err: any) {
        console.error('Failed to drop old relations graph: ', err.cause);
        throw err;
    }
}

export { generateSimilarityGraph, generateRelationsGraph, getSimilarUsers, dropOldRelationsGraph };
