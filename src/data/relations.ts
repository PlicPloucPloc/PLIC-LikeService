import { driver } from '../libs/neo4j';

async function getUserNode(userId: string) {
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

async function getApartment(aptId: number) {
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

async function getRelation(userId: string, aptId: number) {
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

async function getRelations(userId: string) {
    console.log('Fetching data for user: ' + userId);
    try {
        const { records } = await driver.executeQuery(
            "MATCH (p:Person {id:\'" + userId + "\'})-[r]->(a:Appartment) RETURN r, a",
        );
        return records;
    } catch (err: any) {
        console.error('Failed to get relations: ', err.cause);
        throw err;
    }
}

async function getLikes(userId: string) {
    try {
        console.log("Fetching dislikes for user: " + userId);
        const { records } = await driver.executeQuery(
            "MATCH (p:Person {id:\'" + userId + "\'})-[r:LIKE]->(a:Appartment) RETURN a",
        );
        return records;
    } catch (err: any) {
        console.error('Failed to get apartment: ', err.cause);
        throw err;
    }
}

async function getDislikes(userId: string) {
    try {
        const { records } = await driver.executeQuery(
            "MATCH (p:Person {id:\'" + userId + "\'})-[r:DISLIKE]->(a:Appartment) RETURN a",
        );
        return records;
    } catch (err: any) {
        console.error('Failed to get apartment: ', err.cause);
        throw err;
    }
}

async function addUser(userId: string): Promise<void> {
    try {
        await driver.executeQuery("Create (:Person {id:\'" + userId + "\'})");
    } catch (err: any) {
        console.error('Failed to add user: ', err.cause);
        throw err;
    }
}

async function addAppartment(aptId: number): Promise<void> {
    try {
        await driver.executeQuery("Create (:Appartment {id:\'" + aptId + "\'})");
    } catch (err: any) {
        console.error('Failed to add apartment: ', err.cause);
        throw err;
    }
}

async function addLike(userId: string, aptId: number): Promise<void> {
    try {
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

async function addDislike(userId: string, aptId: number): Promise<void> {
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

async function removeUser(userId: string) {
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

async function removeAppartment(aptId: number) {
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
async function removeRelation(userId: string, aptId: number): Promise<void> {
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

export {
    getUserNode,
    getApartment,
    getRelation,
    addUser,
    addAppartment,
    addLike,
    addDislike,
    removeUser,
    removeAppartment,
    removeRelation,
    getRelations,
    getLikes,
    getDislikes,
};
