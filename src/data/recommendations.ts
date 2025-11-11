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

export async function getSimilarUsersColloc(id: string, skip: number, limit: number) {
    const { records } = await driver.executeQuery(
        `CALL gds.nodeSimilarity.stream('relationsGraph') YIELD node1, node2, similarity WHERE gds.util.asNode(node1).id = '${id}' AND gds.util.asNode(node1).isColloc = 'true' RETURN gds.util.asNode(node1).id AS Person1, gds.util.asNode(node2).id AS Person2, similarity ORDER BY similarity DESCENDING, Person1, Person2 SKIP ${skip} LIMIT ${limit}`
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

export async function orderByProximity(aptIds: number[], userId: string) : Promise<number[]>{
    const session = driver.session();
    const parameters = {
        ids: aptIds
    }
    const query =  `
            MATCH (u:Person {id: '${userId}'})
            UNWIND $ids AS targetApartmentId
            OPTIONAL MATCH (a:Apartment {id: targetApartmentId})
            OPTIONAL MATCH p=(u)-[*2..7]-(a)
            RETURN targetApartmentId AS id, count(p) AS pathCount 
                ORDER BY pathCount`;
    try {
        const result = await session.run(query, parameters);
        return result.records.map(record => record.get('id'));
    } catch (err: any) {
        console.error('Failed to order apartment ids: ', err);
        throw err;
    } finally {
        await session.close()
    }

} 
