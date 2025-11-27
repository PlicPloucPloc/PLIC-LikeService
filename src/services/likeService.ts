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
    updateUserCollocStatus,
    getRelationsPaginated,
} from '../data/relations';
import { HttpError } from 'elysia-http-error';
import { fetchApartment, fetchApartmentInfo } from '../data/apartments';
import { relation } from '../models/relation';
import { relation_type } from '../models/relation_type';
import { apartment_info } from '../models/apartment_info';
import { getLogger } from './logger';
import { Logger } from 'winston';

const logger: Logger = getLogger('Like');

export async function addRelation(bearer: string,userId: string, aptId: number, isLike: boolean): Promise<void> {
    if (!(await fetchApartment(bearer, aptId))) {
        throw HttpError.NotFound('Apartment not found');
    }

    logger.info(`Adding relation: ${userId} : ${aptId} : ${isLike}`);
    if ((await getApartment(aptId)).length == 0) {
        logger.info(`Creating Apt : ${aptId}`);
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
        logger.error('Relation not found');
        throw HttpError.NotFound('Relation not found');
    }
    await removeRelation(userId, aptId);
}

export async function updateRelation(userId: string, aptId: number, isLike: boolean): Promise<void> {
    if ((await getApartment(aptId)).length == 0 || (await getUserNode(userId)).length == 0) {
        logger.error('Relation not found');
        throw HttpError.NotFound('Relation not found');
    }
    await removeRelation(userId, aptId);
    if (isLike) {
        await addLike(userId, aptId);
    } else {
        await addDislike(userId, aptId);
    }
}

export async function getAllRelations(bearer: string, userId: string): Promise<relation[]> {
    const relations = await getRelations(userId);
    return Promise.all(
        relations.map(async (rel) => {
            logger.info('r: ', rel.get('r').type);
            return new relation(
                rel.get('r').type,
                await getApartmentInfo(bearer, rel.get('a').properties.id),
            );
        }),
    );
}

export async function getAllRelationsPaginated(bearer: string, userId: string, skip: number, limit: number): Promise<relation[]> {
    const relations = await getRelationsPaginated(userId, skip, limit);
    return Promise.all(
        relations.map(async (rel) => {
            logger.info('r: ', rel.get('r').type);
            return new relation(
                rel.get('r').type,
                await getApartmentInfo(bearer, rel.get('a').properties.id),
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
        logger.info(`Creating Apt : ${aptId}`);
        addAppartment(aptId);
    }
}

export async function createUserNode(userId: string): Promise<void> {
    logger.info(`Creating user: ${userId}`);
    if ((await getUserNode(userId)).length == 0) {
        addUser(userId);
    }
}

export async function setUserCollocStatus(userId: string, isColloc: string): Promise<void> {
    await updateUserCollocStatus(userId, isColloc);
}

export async function getUserCollocStatus(userId: string): Promise<boolean> {
    var user = await getUserNode(userId);
    return user[0].get('u').properties.isColloc == "true";
}
