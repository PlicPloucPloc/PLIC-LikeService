import Elysia, { t } from 'elysia';
import { bearer } from '@elysiajs/bearer';
import {
    addRelation,
    deleteRelation,
    updateRelation,
    getAllRelations,
    getAllLikes,
    getAllDislikes,
    createUserNode,
    createApartmentNode,
    setUserCollocStatus,
    getUserCollocStatus,
} from '../services/like_service';
import { generateRecommendations, getRecommendedApartments, getRecommendedColloc } from '../services/recommendations_service';
import { verifyUser } from '../services/user_verification_service';
import { handleError, handleMissingBearer, handleResponse } from '../services/responseService';
import { getLogger } from '../services/logger';
import { Logger } from 'winston';

const likeRoutes = new Elysia();
const logger: Logger = getLogger('Routes');

likeRoutes.use(bearer()).get(
    '/all',
    async ({ bearer, query }) => {
        try {
            const skip = query.skip ? parseInt(query.skip) : 0;
            const limit = query.limit ? parseInt(query.limit) : 10;
            const userId = await verifyUser(bearer);
            return await getAllRelations(bearer, userId, skip, limit);
        } catch (error) {
            return handleError(error);
        }
    },
    {
        beforeHandle({ bearer, set }) {
            if (!bearer)  return handleMissingBearer(set); 
        },
    },
);

likeRoutes.use(bearer()).get(
    '/likes/:isFilterColoc',
    async ({ bearer, query }) => {
        try {
            const skip = query.skip ? parseInt(query.skip) : 0;
            const limit = query.limit ? parseInt(query.limit) : 10;
            const userId = await verifyUser(bearer);
            return await getAllLikes(bearer, userId, skip, limit);
        } catch (error) {
            return handleError(error);
        }
    },
    {
        beforeHandle({ bearer, set }) {
            if (!bearer)  return handleMissingBearer(set); 
        },
    },
);

likeRoutes.use(bearer()).get(
    '/dislikes',
    async ({ bearer, query }) => {
        try {
            const skip = query.skip ? parseInt(query.skip) : 0;
            const limit = query.limit ? parseInt(query.limit) : 10;
            const userId = await verifyUser(bearer);
            return await getAllDislikes(bearer, userId, skip, limit);
        } catch (error) {
            return handleError(error);
        }
    },
    {
        beforeHandle({ bearer, set }) {
            if (!bearer)  return handleMissingBearer(set); 
        },
    },
);

likeRoutes.use(bearer()).post(
    '/',
    async ({ bearer, body }) => {
        try {
            const userId = await verifyUser(bearer);
            logger.info(`Adding relation for user: ${userId} and apartment: ${body.aptId}`);
            await addRelation(bearer, userId, body.aptId, body.isLike);
            return handleResponse('{"status": "OK"}', 200);
        } catch (error) {
            return handleError(error);
        }
    },
    {
        body: t.Object({
            aptId: t.Number(),
            isLike: t.Boolean(),
        }),
        beforeHandle({ bearer, set }) {
            if (!bearer)  return handleMissingBearer(set); 
        },
    },
);

likeRoutes.use(bearer()).put(
    '/',
    async ({ bearer, body }) => {
        try {
            const userId = await verifyUser(bearer);
            await updateRelation(userId, body.aptId, body.isLike);
            return handleResponse('{"status": "OK"}', 200);
        } catch (error) {
            return handleError(error);
        }
    },
    {
        body: t.Object({
            aptId: t.Number(),
            isLike: t.Boolean(),
        }),
        beforeHandle({ bearer, set }) {
            if (!bearer)  return handleMissingBearer(set); 
        },
    },
);

likeRoutes.use(bearer()).delete(
    '/',
    async ({ bearer, body }) => {
        try {
            const userId = await verifyUser(bearer);
            await deleteRelation(userId, body.aptId);
            return handleResponse('{"status": "Deleted"}', 204);
        } catch (error) {
            return handleError(error);
        }
    },
    {
        body: t.Object({
            aptId: t.Number(),
        }),
        beforeHandle({ bearer, set }) {
            if (!bearer)  return handleMissingBearer(set); 
        },
    },
);

likeRoutes.use(bearer()).get(
    '/noRelations',
    async ({ bearer, query }) => {
        try {
            console.log("Query: ", query);
            const limit = query.limit ? parseInt(query.limit) : 10;

            const userId = await verifyUser(bearer);
            logger.info(`Getting recommended apartments for user: ${userId}`);
            return await getRecommendedApartments(bearer, userId, limit);
        } catch (error) {
            return handleError(error);
        }
    },
    {
        beforeHandle({ bearer, set }) {
            if (!bearer)  return handleMissingBearer(set); 
        },
    },
);

likeRoutes.use(bearer()).post(
    '/aptNode',
    async ({ bearer, body }) => {
        try {
            logger.info(`Body: ${JSON.stringify(body)}`);
            await verifyUser(bearer);
            logger.info(`Creating apartment node for aptId: ${body.aptId} `);
            await createApartmentNode(body.aptId);
            return handleResponse('{"status": "Created"}', 201);
        } catch (error) {
            return handleError(error);
        }
    },
    {
        body: t.Object({
            aptId: t.Number(),
        }),
        beforeHandle({ bearer, set }) {
            if (!bearer)  return handleMissingBearer(set); 
        },
    },
);

likeRoutes.use(bearer()).post(
    '/userNode',
    async ({ bearer }) => {
        try {
            const userId = await verifyUser(bearer);
            createUserNode(userId);
            return handleResponse('{"status": "Created"}', 201);
        } catch (error) {
            return handleError(error);
        }
    },
    {
        beforeHandle({ bearer, set }) {
            if (!bearer)  return handleMissingBearer(set); 
        },
    },
);

likeRoutes.post('/generateRecommendations', async () => {
    try {
        await generateRecommendations();
    } catch (error) {
            return handleError(error);
    }
    return handleResponse('{"status": "Created"}', 201);
});

likeRoutes.use(bearer()).get('/recommendedColloc', 
    async ({query, bearer}) => {
        try {
            const userId = await verifyUser(bearer);
            return await getRecommendedColloc(userId, query.skip ? parseInt(query.skip) : 0, query.limit ? parseInt(query.limit) : 10);
        } catch (error) {
            return handleError(error);
        }
    },
    {
        beforeHandle({ bearer, set }) {
            if (!bearer)  return handleMissingBearer(set); 
        },
    }
);


likeRoutes.use(bearer()).patch('/allowColloc', 
    async ({query, bearer}) => {
        try {
            const userId = await verifyUser(bearer);
            await setUserCollocStatus(userId, query.allowColloc);
            return handleResponse('{"status": "OK"}', 200);
        } catch (error) {
            return handleError(error);
        }
    },
    {
        beforeHandle({ bearer, set }) {
            if (!bearer)  return handleMissingBearer(set); 
        },
    }
);

likeRoutes.use(bearer()).get('/isColloc', 
    async ({bearer}) => {
        try {
            const userId: string = await verifyUser(bearer);
            const isColloc: boolean = await getUserCollocStatus(userId);
            return handleResponse(`{"isCollocEnabled": "${isColloc}"}`, 200)
        } catch (error) {
            return handleError(error);
        }
    },
    {
        beforeHandle({ bearer, set }) {
            if (!bearer)  return handleMissingBearer(set); 
        },
    }
);

export { likeRoutes };
