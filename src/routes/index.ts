import Elysia, { t } from 'elysia';
import { bearer } from '@elysiajs/bearer';
import {
    addRelation,
    deleteRelation,
    updateRelation,
    getAllRelations,
    getAllLikes,
    getAllDislikes,
} from '../services/like_service';
import { HttpError } from 'elysia-http-error';

const likeRoutes = new Elysia();

likeRoutes.use(bearer()).get(
    '/all',
    async ({ bearer,body }) => {
        try {
            return await getAllRelations(bearer, body.skip, body.limit);
        } catch (error) {
            if (error instanceof HttpError) {
                return new Response(`{\"message\": ${error.message}}`, {
                    status: error.statusCode,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw error;
        }
    },
    {
        body: t.Object({
            skip: t.Number(),
            limit: t.Number(),
        }),
        beforeHandle({ bearer, set }) {
            if (!bearer) {
                set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;
                return new Response(`{\"message\": \"Bearer not found or invalid"}`, {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        },
    },
);

likeRoutes.use(bearer()).get(
    '/likes/:isFilterColoc',
    async ({ bearer, body }) => {
        try {
            return await getAllLikes(bearer, body.skip, body.limit);
        } catch (error) {
            if (error instanceof HttpError) {
                return new Response(`{\"message\": ${error.message}}`, {
                    status: error.statusCode,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw error;
        }
    },
    {
        body: t.Object({
            skip: t.Number(),
            limit: t.Number(),
        }),
        beforeHandle({ bearer, set }) {
            if (!bearer) {
                set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;

                return new Response(`{\"message\": \"Bearer not found or invalid"}`, {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        },
    },
);

likeRoutes.use(bearer()).get(
    '/dislikes',
    async ({ bearer, body }) => {
        try {
            return await getAllDislikes(bearer, body.skip, body.limit);
        } catch (error) {
            if (error instanceof HttpError) {
                return new Response(`{\"message\": ${error.message}}`, {
                    status: error.statusCode,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
            throw error;
        }
    },
    {
        body: t.Object({
            skip: t.Number(),
            limit: t.Number(),
        }),
        beforeHandle({ bearer, set }) {
            if (!bearer) {
                set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;

                return new Response(`{\"message\": \"Bearer not found or invalid"}`, {
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
                return new Response(`{\"message\": ${error.message}}`, {
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

                return new Response(`{\"message\": \"Bearer not found or invalid"}`, {
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
                return new Response(`{\"message\": ${error.message}}`, {
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

                return new Response(`{\"message\": \"Bearer not found or invalid"}`, {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        },
    },
);

likeRoutes.use(bearer()).delete(
    '/',
    ({ bearer, body }) => {
        try {
            deleteRelation(bearer, body.aptId);
            return new Response('{"status": "OK"}', {
                status: 204,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            if (error instanceof HttpError) {
                return new Response(`{\"message\": ${error.message}}`, {
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

                return new Response(`{\"message\": \"Bearer not found or invalid"}`, {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        },
    },
);

export { likeRoutes };
