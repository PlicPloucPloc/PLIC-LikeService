import { driver } from "../libs/neo4j";

async function addUser(userId :string){
    try {
        const ret = await driver.executeQuery(
            "Create (:Person {id:\'" + userId + "\'})"
        )
    } catch(err : any) {
        console.error("Failed to add user: ", err.cause)
        throw err;
    }
}

export {addUser};
