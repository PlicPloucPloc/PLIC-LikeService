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
    fetchApartmentNoRelations,
} from '../data/relations';
import { HttpError } from 'elysia-http-error';
import { getUser } from '../data/users';
import { fetchApartment, fetchApartmentInfo } from '../data/apartments';
import { relation } from '../models/relation';
import { relation_type } from '../models/relation_type';
import apartment_info from '../models/apartment_info';

async function addRelation(bearer: string, aptId: number, isLike: boolean): Promise<void> {
    const userId = await getUser(bearer);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }

    if (!(await fetchApartment(bearer, aptId))) {
        throw HttpError.NotFound('Apartment not found');
    }
    if (!((await getUserNode(userId)).length > 0)) {
        await addUser(userId);
    }

    console.log('Adding relation: ' + userId + ' : ' + aptId + ' : ' + isLike);
    if ((await getApartment(aptId)).length == 0) {
        console.log('Creating Apt : ' + aptId);
        await addAppartment(aptId);
    }
    if ((await getRelation(userId, aptId)).length > 0) {
        throw HttpError.BadRequest('Relation already exists');
    }

    if (isLike) {
        await addLike(userId, aptId);
    } else {
        await addDislike(userId, aptId);
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

async function getAllRelations(bearer: string, skip: number, limit: number): Promise<relation[]> {
    const userId = await getUser(bearer);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }
    console.log('In service');
    const relations = await getRelations(userId, skip, limit);
    return Promise.all(
        relations.map(async (rel) => {
            console.log('r: ', rel.get('r').type);
            return new relation(
                rel.get('r').type,
                await getApartmentInfo(bearer, rel.get('a').properties.id),
            );
        }),
    );
}

async function getApartmentsNoRelations(bearer: string, skip: number, limit: number): Promise<{aptIds: number[]}> {
    const userId = await getUser(bearer);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }
    const apartments = await fetchApartmentNoRelations(userId, skip,limit);
    return { aptIds : apartments.map(apt => apt.get('a').properties.id)};
}

async function getAllLikes(bearer: string, skip: number, limit: number): Promise<relation[]> {
    const userId = await getUser(bearer);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }
    const relations = await getLikes(userId, skip, limit);
    return Promise.all(
        relations.map(
            async (rel) =>
                new relation(
                    relation_type[relation_type.LIKE],
                    await getApartmentInfo(bearer, rel.get('a').properties.id),
                ),
        ),
    );
}

async function getAllDislikes(bearer: string, skip: number, limit: number): Promise<relation[]> {
    const userId = await getUser(bearer);
    console.log('UserId: ', userId);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }
    const relations = await getDislikes(userId, skip, limit);
    return Promise.all(
        relations.map(
            async (rel) =>
                new relation(
                    relation_type[relation_type.DISLIKE],
                    await getApartmentInfo(bearer, rel.get('a').properties.id),
                ),
        ),
    );
}

async function getApartmentInfo(bearer: string, aptId: number): Promise<apartment_info> {
    const userId = await getUser(bearer);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }
    const aptInfo = await fetchApartmentInfo(bearer, aptId);
    return aptInfo;
}

async function createAppartmentNode(bearer: string, aptId: number): Promise<void> {
    const userId = await getUser(bearer);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }
    if ((await getApartment(aptId)).length == 0) {
        console.log('Creating Apt : ' + aptId);
        addAppartment(aptId);
    }
}

async function createUserNode(bearer: string): Promise<void> {
    const userId = await getUser(bearer);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }
    if ((await getUserNode(userId)).length == 0) {
        addUser(userId);
    }
}

export {
    addRelation,
    deleteRelation,
    updateRelation,
    getAllRelations,
    getAllLikes,
    getAllDislikes,
    createAppartmentNode,
    createUserNode,
    getApartmentsNoRelations,
};
