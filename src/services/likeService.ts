import { NotFoundError } from "elysia";
import { addAppartment, addUser, addLike, addDislike, getAppartment, getUser, removeRelation, getRelation } from "../data/relations";
import { HttpError } from "elysia-http-error";

async function addRelation(userId : string, aptId : string, isLike : boolean){
    console.log("Adding relation: " +  userId + " : " + aptId + " : " + isLike);
    if ((await getAppartment(aptId)).length == 0){
        console.log("Creating Apt : " + aptId);
        addAppartment(aptId);
    }
    if((await getUser(userId)).length == 0) {
        addUser(userId);
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

async function deleteRelation(userId : string, aptId : string){
    if ((await getAppartment(aptId)).length == 0  || (await getUser(userId)).length == 0){
        console.error("Relation not found");
        throw HttpError.NotFound("Relation not found");
    }
    return removeRelation(userId, aptId);
}
 
async function updateRelation(userId : string, aptId : string, isLike : boolean) {
    if ((await getAppartment(aptId)).length == 0  || (await getUser(userId)).length == 0){
        console.error("Relation not found");
        throw HttpError.NotFound("Relation not found");
    }
    await removeRelation(userId, aptId);
    console.log("REmoved")
    return await addRelation(userId, aptId, isLike)
}

async function getAllRealtions(userId : string) {
    const relations = await getRelations(userId);
    if (relations.length == 0) {
        console.error("User not found");
        throw HttpError.NotFound("User not found");
    }
    return relations;
}

async function getAllLikes(userId : string) {
    const relations = await getAllLikes(userId);
    if (relations.length == 0) {
        console.error("User not found");
        throw HttpError.NotFound("User not found");
    }
    return relations;
}

export {addRelation, deleteRelation, updateRelation};
