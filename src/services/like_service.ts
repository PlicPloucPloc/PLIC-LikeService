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
    getRelationsUnpaginated,
} from '../data/relations';
import { HttpError } from 'elysia-http-error';
import { fetchApartment, fetchApartmentInfo } from '../data/apartments';
import { relation } from '../models/relation';
import { relation_type } from '../models/relation_type';
import { apartment_info } from '../models/apartment_info';

export async function addRelation(bearer: string,userId: string, aptId: number, isLike: boolean): Promise<void> {
    if (!(await fetchApartment(bearer, aptId))) {
        throw HttpError.NotFound('Apartment not found');
    }
    if ((await getUserNode(userId)).length == 0){ // TODO Remove when user workflow has been updated
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

export async function deleteRelation(userId: string, aptId: number): Promise<void> {
    if ((await getApartment(aptId)).length == 0 || (await getUserNode(userId)).length == 0) {
        console.error('Relation not found');
        throw HttpError.NotFound('Relation not found');
    }
    await removeRelation(userId, aptId);
}

export async function updateRelation(userId: string, aptId: number, isLike: boolean): Promise<void> {
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

export async function getAllRelations(userId: string, skip: number, limit: number): Promise<relation[]> {
    const relations = await getRelations(userId, skip, limit);
    return Promise.all(
        relations.map(async (rel) => {
            console.log('r: ', rel.get('r').type);
            return new relation(
                rel.get('r').type,
                await getApartmentInfo(userId, rel.get('a').properties.id),
            );
        }),
    );
}

export async function getApartmentsNoRelations(
    userId: string,
    skip: number,
    limit: number,
): Promise<{ aptIds: number[] }> {
    const apartments = await fetchApartmentNoRelations(userId, skip, limit);
    return { aptIds: apartments.map((apt) => apt.get('a').properties.id) };
}

export async function getAllLikes(bearer: string, userId: string, skip: number, limit: number): Promise<relation[]> {
    const relations = await getLikes(userId, skip, limit);
    return Promise.all(
        relations.map(
            async (rel) => new relation(
                    relation_type[relation_type.LIKE],
                    await getApartmentInfo(bearer, rel.get('a').properties.id),
                ),
        ),
    );
}

export async function getAllDislikes(bearer: string, userId: string, skip: number, limit: number): Promise<relation[]> {
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

export async function getApartmentInfo(userId: string, aptId: number): Promise<apartment_info> {
    const aptInfo = await fetchApartmentInfo(userId, aptId);
    return aptInfo;
}

export async function createApartmentNode(aptId: number): Promise<void> {
    if ((await getApartment(aptId)).length == 0) {
        console.log('Creating Apt : ' + aptId);
        addAppartment(aptId);
    }
}

export async function createUserNode(userId: string): Promise<void> {
    console.log('Creating user: ' + userId);
    if ((await getUserNode(userId)).length == 0) {
        addUser(userId);
    }
}
