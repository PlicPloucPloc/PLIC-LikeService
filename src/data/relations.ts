import { driver } from '../libs/neo4j';

export async function getUserNode(userId: string) {
    try {
        const { records } = await driver.executeQuery(
            "MATCH (u:Person {id:\'" + userId + "\'}) RETURN u",
        );
        return records;
    } catch (err: any) {
        console.error('Failed to get user: ', err.cause);
        throw err;
    }
}

export async function getApartment(aptId: number) {
    try {
        const { records } = await driver.executeQuery(
            "MATCH (a:Appartment {id:\'" + aptId + "\'}) RETURN a",
        );
        return records;
    } catch (err: any) {
        console.error('Failed to get apartment: ', err.cause);
        throw err;
    }
}

export async function getRelation(userId: string, aptId: number) {
    try {
        const { records } = await driver.executeQuery(
            "MATCH (p:Person {id:\'" +
                userId +
                "\'})-[r]->(a:Appartment {id: \'" +
                aptId +
                "\'})RETURN r",
        );
        return records;
    } catch (err: any) {
        console.error('Failed to get apartment: ', err.cause);
        throw err;
    }
}

export async function getRelations(userId: string, skip: number, limit: number) {
    console.log(`Fetching relations for user: ${userId} with skip: ${skip} and limit: ${limit}`);
    try {
        const { records } = await driver.executeQuery(
            "MATCH (p:Person {id:\'" +
                userId +
                "\'})-[r]->(a:Appartment) RETURN r, a" +
                ' SKIP ' +
                skip +
                ' LIMIT ' +
                limit,
        );
        return records;
    } catch (err: any) {
        console.error('Failed to get relations: ', err.cause);
        throw err;
    }
}

export async function getRelationsUnpaginated(userId: string) {
    console.log(`Fetching relations for user: ${userId}`);
    try {
        const { records } = await driver.executeQuery(
            "MATCH (p:Person {id:\'" +
                userId +
                "\'})-[r]->(a:Appartment) RETURN r, a",
        );
        return records;
    } catch (err: any) {
        console.error('Failed to get relations: ', err.cause);
        throw err;
    }
}

export async function getLikes(userId: string, skip: number, limit: number) {
    try {
        const { records } = await driver.executeQuery(
            "MATCH (p:Person {id:\'" +
                userId +
                "\'})-[r:LIKE]->(a:Appartment) RETURN a" +
                ' SKIP ' +
                skip +
                ' LIMIT ' +
                limit,
        );
        return records;
    } catch (err: any) {
        console.error('Failed to get apartment: ', err.cause);
        throw err;
    }
}

export async function getDislikes(userId: string, skip: number, limit: number) {
    try {
        console.log('Fetching dislikes for user: ' + userId);
        const { records } = await driver.executeQuery(
            "MATCH (p:Person {id:\'" +
                userId +
                "\'})-[r:DISLIKE]->(a:Appartment) RETURN a" +
                ' SKIP ' +
                skip +
                ' LIMIT ' +
                limit,
        );
        return records;
    } catch (err: any) {
        console.error('Failed to get apartment: ', err.cause);
        throw err;
    }
}

export async function addUser(userId: string): Promise<void> {
    try {
        await driver.executeQuery("Create (:Person {id:\'" + userId + "\', isColloc: false})");
    } catch (err: any) {
        console.error('Failed to add user: ', err.cause);
        throw err;
    }
}

export async function updateUserCollocStatus(id: string, isColloc: string) : Promise<void> {
    try {
        await driver.executeQuery(` MATCH (p:Person {id: '${id}'}) SET p.isColloc = '${isColloc}' RETURN p `);
    }
    catch (err: any) {
        console.error('Failed to update user colloc status: ', err.cause);
        throw err;
    }
}

export async function addAppartment(aptId: number): Promise<void> {
    try {
        await driver.executeQuery("Create (:Appartment {id:\'" + aptId + "\'})");
    } catch (err: any) {
        console.error('Failed to add apartment: ', err.cause);
        throw err;
    }
}

export async function addLike(userId: string, aptId: number): Promise<void> {
    try {
        console.log('Adding LIKE relation between user: ' + userId + ' and apt: ' + aptId);
        await driver.executeQuery(
            "MATCH (u:Person {id:\'" +
                userId +
                "\'}), (a:Appartment {id:\'" +
                aptId +
                "\'}) " +
                'CREATE (u)-[r:LIKE]->(a) ',
        );
    } catch (err: any) {
        console.error('Failed to create relation: ', err.cause);
        throw err;
    }
}

export async function addDislike(userId: string, aptId: number): Promise<void> {
    try {
        await driver.executeQuery(
            "MATCH (u:Person {id:\'" +
                userId +
                "\'}), (a:Appartment {id:\'" +
                aptId +
                "\'}) " +
                'CREATE (u)-[r:DISLIKE]->(a) ',
        );
    } catch (err: any) {
        console.error('Failed to create relation: ', err.cause);
        throw err;
    }
}

export async function removeUser(userId: string) {
    try {
        const { records } = await driver.executeQuery(
            "DELETE (u:Person {id:\'" + userId + "\'}) RETURN u",
        );
        return records;
    } catch (err: any) {
        console.error('Failed to remove user: ', err.cause);
        throw err;
    }
}

export async function removeAppartment(aptId: number) {
    try {
        const { records } = await driver.executeQuery(
            "DELETE (a:Appartment {id:\'" + aptId + "\'}) RETURN a",
        );
        console.log('Result: ' + records);
        return records;
    } catch (err: any) {
        console.error('Failed to remove apartment: ', err.cause);
        throw err;
    }
}
export async function removeRelation(userId: string, aptId: number): Promise<void> {
    try {
        await driver.executeQuery(
            "MATCH (u:Person {id:\'" +
                userId +
                "\'})-[r]->(a:Appartment {id:\'" +
                aptId +
                "\'}) " +
                'DELETE r',
        );
    } catch (err: any) {
        console.error('Failed to create relation: ', err.cause);
        throw err;
    }
}

export async function fetchApartmentNoRelations(
    userId: string,
    skip: number,
    limit: number,
): Promise<any[]> {
    try {
        console.log('Fetching apartments with no relations for user: ' + userId);
        const { records } = await driver.executeQuery(
            'MATCH (p:Person {id:"' +
                userId +
                '"}) ' +
                'MATCH (a:Appartment) ' +
                'WHERE NOT (p)-[]->(a) ' +
                'RETURN a ' +
                'SKIP ' +
                skip +
                ' LIMIT ' +
                limit,
        );

        return records;
    } catch (err: any) {
        console.error('Failed to get apartments: ', err.cause);
        throw err;
    }
}

export async function fetchApartmentWithZeroRelations(skip: number,limit: number): Promise<any[]> {
    try {
        const { records } = await driver.executeQuery(
            'MATCH (a:Appartment) ' +
                'WHERE NOT ()-[]->(a) ' +
                'RETURN a ' +
                'SKIP ' +
                skip +
                ' LIMIT ' +
                limit,
        );

        return records;
    } catch (err: any) {
        console.error('Failed to get apartments: ', err.cause);
        throw err;
    }
}
