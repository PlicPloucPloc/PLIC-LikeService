import { addUser } from "../data/relations";

async function addRelation(userId : string, aptId : string, isLike : boolean){
    console.error("Hum");
    addUser(userId);
}

export {addRelation};
