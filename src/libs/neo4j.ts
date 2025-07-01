import neo4j, { Driver } from 'neo4j-driver';

const URI: string = process.env.NEO4J_URL || 'neo4j://localhost:7687';
const USER: string = process.env.NEO4J_USER || 'neo4j';
const PASSWORD: string = process.env.NEO4J_PASSWORD || 'neo4j';

console.log('User: ' + USER + '; Password: ' + PASSWORD);

let driver: Driver;

try {
    console.log('Trying to connect to neo4j on: ' + URI);
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    const serverInfo = await driver.getServerInfo();
    console.log('Connection to neo4j established');
    console.log(serverInfo);
} catch (err: any) {
    console.error('Error connection to neo4j: ' + err);
}

export { driver };
