import {
    addAppartment,
    addUser,
    addLike,
    addDislike,
    getApartment,
    removeRelation,
    getRelation,
    getRelations,
    getLikes,
    getUserNode,
    getDislikes,
} from '../data/relations';
import { HttpError } from 'elysia-http-error';
import { getUser } from '../data/users';
import { fetchApartment } from '../data/apartments';
import { relation } from '../models/relation';
import { relation_type } from '../models/relation_type';

async function addRelation(bearer: string, aptId: number, isLike: boolean): Promise<void> {
    const userId = await getUser(bearer);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }

    if (!(await fetchApartment(bearer, aptId))) {
        throw HttpError.NotFound('Apartment not found');
    }
    if (!((await getUserNode(userId)).length > 0)) {
        addUser(userId);
    }

    console.log('Adding relation: ' + userId + ' : ' + aptId + ' : ' + isLike);
    if ((await getApartment(aptId)).length == 0) {
        console.log('Creating Apt : ' + aptId);
        addAppartment(aptId);
    }
    if ((await getRelation(userId, aptId)).length > 0) {
        throw HttpError.BadRequest('Relation already exist');
    }

    if (isLike) {
        addLike(userId, aptId);
    } else {
        addDislike(userId, aptId);
    }
}

async function deleteRelation(bearer: string, aptId: number): Promise<void> {
    const userId = await getUser(bearer);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }
    if ((await getApartment(aptId)).length == 0 || (await getUserNode(userId)).length == 0) {
        console.error('Relation not found');
        throw HttpError.NotFound('Relation not found');
    }
    await removeRelation(userId, aptId);
}

async function updateRelation(bearer: string, aptId: number, isLike: boolean): Promise<void> {
    const userId = await getUser(bearer);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }
    if ((await getApartment(aptId)).length == 0 || (await getUserNode(userId)).length == 0) {
        console.error('Relation not found');
        throw HttpError.NotFound('Relation not found');
    }
    await removeRelation(userId, aptId);
    if (isLike) {
        await addLike(userId, aptId);
    } else {
        await addDislike(userId, aptId);
    }
}

async function getAllRelations(bearer: string): Promise<relation[]> {
    const userId = await getUser(bearer);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }
    console.log('In service');
    const relations = await getRelations(userId);
    if (relations.length == 0) {
        console.error('User not found');
        throw HttpError.NotFound('User not found');
    }
    return relations.map((rel) => {
        console.log('r: ', rel.get('r').type);
        return new relation(rel.get('r').type, rel.get('a').properties.id);
    });
}

async function getAllLikes(bearer: string): Promise<relation[]> {
    const userId = await getUser(bearer);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }
    const relations = await getLikes(userId);
    if (relations.length <= 0) {
        console.error('User not found');
        throw HttpError.NotFound('User not found');
    }
    return relations.map((rel) => new relation(relation_type.LIKE, rel.get('a').properties.id));
}

async function getAllDislikes(bearer: string): Promise<relation[]> {
    const userId = await getUser(bearer);
    console.log('UserId: ', userId);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }
    const relations = await getDislikes(userId);
    if (relations.length <= 0) {
        console.error('User not found');
        throw HttpError.NotFound('User not found');
    }
    return relations.map((rel) => new relation(relation_type.DISLIKE, rel.get('a').properties.id));
}

export {
    addRelation,
    deleteRelation,
    updateRelation,
    getAllRelations,
    getAllLikes,
    getAllDislikes,
};
