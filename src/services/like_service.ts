import { addAppartment, addUser, addLike, addDislike, getAppartment,  removeRelation, getRelation, getRelations, getLikes, getUserNode } from "../data/relations";
import { HttpError } from "elysia-http-error";
import { getUser } from "../data/users";

async function addRelation(bearer : string, aptId : string, isLike : boolean){
    const userId = await getUser(bearer) 
    if(!userId) {
        throw HttpError.Unauthorized("User do not exist");
    }
    if (!((await getUserNode(userId)).length > 0)){
        addUser(userId);
    }
    console.log("Adding relation: " +  userId + " : " + aptId + " : " + isLike);
    if ((await getAppartment(aptId)).length == 0){
        console.log("Creating Apt : " + aptId);
        addAppartment(aptId);
    }
    if ((await getRelation(userId, aptId)).length > 0){
        throw HttpError.BadRequest("Relation already exist");
    }
    if (isLike) {
        addLike(userId, aptId);
    } else {
        addDislike(userId, aptId);
    }
    return "OK";
}

async function deleteRelation(bearer : string, aptId : string){
    const userId = await getUser(bearer) 
    if(!userId) {
        throw HttpError.Unauthorized("User do not exist");
    }
    if ((await getAppartment(aptId)).length == 0  || (await getUser(userId)).length == 0){
        console.error("Relation not found");
        throw HttpError.NotFound("Relation not found");
    }
    return removeRelation(userId, aptId);
}
 
async function updateRelation(bearer : string, aptId : string, isLike : boolean) {
    const userId = await getUser(bearer) 
    if(!userId) {
        throw HttpError.Unauthorized("User do not exist");
    }
    if ((await getAppartment(aptId)).length == 0  || (await getUser(userId)).length == 0){
        console.error("Relation not found");
        throw HttpError.NotFound("Relation not found");
    }
    await removeRelation(userId, aptId);
    console.log("REmoved")
    return await addRelation(userId, aptId, isLike)
}

async function getAllRelations(bearer : string) {
    const userId = await getUser(bearer) 
    if(!userId) {
        throw HttpError.Unauthorized("User do not exist");
    }
    console.log("In service")
    const relations = await getRelations(userId);
    if (relations.length == 0) {
        console.error("User not found");
        throw HttpError.NotFound("User not found");
    }
    return relations.map(relation => {
        console.log("r: ", relation.get("r").type )
        return {
            type: relation.get("r").type,
            aptId: relation.get("a").properties.id
        } 
    });
}

async function getAllLikes(bearer : string){
    const userId = await getUser(bearer) 
    if(!userId) {
        throw HttpError.Unauthorized("User do not exist");
    }
    const relations = await getLikes(userId);
    if (relations.length <= 0) {
        console.error("User not found");
        throw HttpError.NotFound("User not found");
    }
    return relations.map(relation => relation.get("a").properties.id);;
}

export {addRelation, deleteRelation, updateRelation, getAllRelations, getAllLikes};
