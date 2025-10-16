import { driver } from '../libs/neo4j';

export async function generateRelationsGraph(): Promise<any[]> {
    try {
        const { records } = await driver.executeQuery(
            "MATCH (source:Person) OPTIONAL MATCH (source)-[r:LIKE]->(target:Appartment) RETURN gds.graph.project( 'relationsGraph', source, target, { relationshipProperties: r { strength: coalesce(r.strength, 1.0) } })"
        );

        return records;
    } catch (err: any) {
        console.error('Failed to generate relation graph: ', err.cause);
        throw err;
    }
}

export async function generateSimilarityGraph(): Promise<any[]> {
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

export async function getSimilarUsers(id: string) {
    const { records } = await driver.executeQuery(
        `CALL gds.nodeSimilarity.stream('relationsGraph') YIELD node1, node2, similarity WHERE gds.util.asNode(node1).id = '${id}' RETURN gds.util.asNode(node1).id AS Person1, gds.util.asNode(node2).id AS Person2, similarity ORDER BY similarity DESCENDING, Person1, Person2 LIMIT 10`
    );

    return records;
}

export async function dropOldRelationsGraph(): Promise<void> {
    try {
        await driver.executeQuery(
            "CALL gds.graph.drop('relationsGraph',false) YIELD graphName"
        );
    } catch (err: any) {
        console.error('Failed to drop old relations graph: ', err.cause);
        throw err;
    }
}

export async function checkSimilarityGraph() : Promise<any>{
    try {
        const { records } = await driver.executeQuery(`CALL gds.graph.exists('relationsGraph') YIELD graphName, exists RETURN exists`);
        return records[0].get('exists');
    } catch (err: any) {
        console.error('Failed to check similarity graph existence: ', err.cause);
        throw err;
    }

}
