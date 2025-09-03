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
    createAppartmentNode,
    getApartmentsNoRelations,
} from '../services/like_service';
import { HttpError } from 'elysia-http-error';
import { generateRecommendations } from '../services/recommendations_service';

const likeRoutes = new Elysia();

likeRoutes.use(bearer()).get(
    '/all',
    async ({ bearer, query }) => {
        try {
            const skip = query.skip ? parseInt(query.skip) : 0;
            const limit = query.limit ? parseInt(query.limit) : 10;
            return await getAllRelations(bearer, skip, limit);
        } catch (error) {
            if (error instanceof HttpError) {
                return new Response(`{"message": "${error.message}"}`, {
                    status: error.statusCode,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw error;
        }
    },
    {
        beforeHandle({ bearer, set }) {
            if (!bearer) {
                set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;
                return new Response(`{"message": "Bearer not found or invalid"}`, {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        },
    },
);

likeRoutes.use(bearer()).get(
    '/likes/:isFilterColoc',
    async ({ bearer, query }) => {
        try {
            const skip = query.skip ? parseInt(query.skip) : 0;
            const limit = query.limit ? parseInt(query.limit) : 10;
            return await getAllLikes(bearer, skip, limit);
        } catch (error) {
            if (error instanceof HttpError) {
                return new Response(`{"message": "${error.message}"}`, {
                    status: error.statusCode,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw error;
        }
    },
    {
        beforeHandle({ bearer, set }) {
            if (!bearer) {
                set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;

                return new Response(`{"message": "Bearer not found or invalid"}`, {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        },
    },
);

likeRoutes.use(bearer()).get(
    '/dislikes',
    async ({ bearer, query }) => {
        try {
            const skip = query.skip ? parseInt(query.skip) : 0;
            const limit = query.limit ? parseInt(query.limit) : 10;
            return await getAllDislikes(bearer, skip, limit);
        } catch (error) {
            if (error instanceof HttpError) {
                return new Response(`{"message": "${error.message}"}`, {
                    status: error.statusCode,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw error;
        }
    },
    {
        beforeHandle({ bearer, set }) {
            if (!bearer) {
                set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;

                return new Response(`{"message": "Bearer not found or invalid"}`, {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        },
    },
);

likeRoutes.use(bearer()).post(
    '/',
    async ({ bearer, body }) => {
        try {
            await addRelation(bearer, body.aptId, body.isLike);
            return new Response('{"status": "OK"}', {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return new Response(`{"message": "${error.message}"}`, {
                    status: error.statusCode,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw error;
        }
    },
    {
        body: t.Object({
            aptId: t.Number(),
            isLike: t.Boolean(),
        }),
        beforeHandle({ bearer, set }) {
            if (!bearer) {
                set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;

                return new Response(`{"message": "Bearer not found or invalid"}`, {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        },
    },
);

likeRoutes.use(bearer()).put(
    '/',
    async ({ bearer, body }) => {
        try {
            await updateRelation(bearer, body.aptId, body.isLike);
            return new Response('{"status": "OK"}', {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return new Response(`{"message": "${error.message}"}`, {
                    status: error.statusCode,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw error;
        }
    },
    {
        body: t.Object({
            aptId: t.Number(),
            isLike: t.Boolean(),
        }),
        beforeHandle({ bearer, set }) {
            if (!bearer) {
                set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;

                return new Response(`{"message": "Bearer not found or invalid"}`, {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        },
    },
);

likeRoutes.use(bearer()).delete(
    '/',
    async ({ bearer, body }) => {
        try {
            await deleteRelation(bearer, body.aptId);
            return new Response(null, { status: 204 });
        } catch (error) {
            if (error instanceof HttpError) {
                return new Response(`{"message": "${error.message}"}`, {
                    status: error.statusCode,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw error;
        }
    },
    {
        body: t.Object({
            aptId: t.Number(),
        }),
        beforeHandle({ bearer, set }) {
            if (!bearer) {
                set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;

                return new Response(`{"message": "Bearer not found or invalid"}`, {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        },
    },
);

likeRoutes.use(bearer()).get(
    '/noRelations',
    async ({ bearer, query }) => {
        try {
            const skip = query.skip ? parseInt(query.skip) : 0;
            const limit = query.limit ? parseInt(query.limit) : 10;
            return await getApartmentsNoRelations(bearer, skip, limit);
        } catch (error) {
            if (error instanceof HttpError) {
                return new Response(`{"message": "${error.message}"}`, {
                    status: error.statusCode,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw error;
        }
    },
    {
        beforeHandle({ bearer, set }) {
            if (!bearer) {
                set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;

                return new Response(`{"message": "Bearer not found or invalid"}`, {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        },
    },
);

likeRoutes.use(bearer()).post(
    '/aptNode',
    async ({ bearer, body }) => {
        try {
            await createAppartmentNode(bearer, body.aptId);
            return new Response('{"status": "OK"}', {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return new Response(`{"message": "${error.message}"}`, {
                    status: error.statusCode,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw error;
        }
    },
    {
        body: t.Object({
            aptId: t.Number(),
        }),
        beforeHandle({ bearer, set }) {
            if (!bearer) {
                set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;

                return new Response(`{"message": "Bearer not found or invalid"}`, {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        },
    },
);

likeRoutes.use(bearer()).post(
    '/userNode',
    async ({ bearer }) => {
        try {
            createUserNode(bearer);
            return new Response('{"status": "OK"}', {
                status: 201,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return new Response(`{"message": "${error.message}"}`, {
                    status: error.statusCode,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw error;
        }
    },
    {
        beforeHandle({ bearer, set }) {
            if (!bearer) {
                set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;

                return new Response(`{"message": "Bearer not found or invalid"}`, {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        },
    },
);

likeRoutes.post('generateRecommendatiosn', async () => {
    try {
        await generateRecommendations();
    } catch (err : any) {
        return new Response(`{"message": "Failed to generate recommendations: ${err.message}"}` , {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    return new Response('{"status": "Recommendation generated"}', {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
    });
});

export { likeRoutes };
