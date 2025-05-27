import Elysia, { t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { addRelation, deleteRelation, updateRelation, getAllRelations, getAllLikes } from "../services/like_service";
import { HttpError } from "elysia-http-error";
import { getUser } from "../data/users";

const likeRoutes = new Elysia({prefix: "/relations"});

likeRoutes.use(bearer()).get('/all', async ({ bearer }) => {
    try {
        if (getUser(bearer) === undefined) {
            return new HttpError('Forbidden: User not found',403);
        }
        return await getAllRelations(bearer);
    } catch (error) {
        if (error instanceof HttpError) {
            return error;
        }
        throw error;
    }
}, {
    beforeHandle({ bearer, set, error }) {
        if (!bearer) {
            set.headers[
                'WWW-Authenticate'
            ] = `Bearer realm='sign', error="invalid_request"`

            return error(400, 'Unauthorized')
        }
    }
})

likeRoutes.use(bearer()).get('/likes/:isFilterColoc', async ({ bearer }) => {
    try {
        if (getUser(bearer) === undefined) {
            return new HttpError('Forbidden: User not found',403);
        }
        return await getAllLikes(bearer);
    } catch (error) {
        if (error instanceof HttpError) {
            return error;
        }
        throw error;
    }
}, {
    beforeHandle({ bearer, set, error }) {
       if(!bearer) {
            set.headers[
                'WWW-Authenticate'
            ] = `Bearer realm='sign', error="invalid_request"`

            return error(400, 'Unauthorized')
       } 
    }
})

likeRoutes.use(bearer()).get('/dislikes', ({ bearer }) => bearer, {
    beforeHandle({ bearer, set, error }) {
        if(!bearer) {
            set.headers[
                'WWW-Authenticate'
            ] = `Bearer realm='sign', error="invalid_request"`
            return error(400, 'Unauthorized')
        }
    }
})

likeRoutes.use(bearer()).post('/', async ({ bearer, body }) => {
    try {
        if (getUser(bearer) === undefined) {
            return new HttpError('Forbidden: User not found',403);
        }
        await addRelation(bearer, body.aptId, body.isLike);
        return "OK";
    } catch(error) {
        if (error instanceof HttpError) {
            return error;
        }
        throw error;
    }
}, {
    body : t.Object({
        aptId: t.String(),
        isLike: t.Boolean()
    }),
    beforeHandle({ bearer, set, error }) {
        if (!bearer) {
            set.headers[
                'WWW-Authenticate'
            ] = `Bearer realm='sign', error="invalid_request"`
            return error(400, 'Unauthorized')
        }
    }
})

likeRoutes.use(bearer()).put('/', async ({ bearer, body }) => {
    try {
        if (getUser(bearer) === undefined) {
            return new HttpError('Forbidden: User not found',403);
        }
        return await updateRelation(bearer, body.aptId, body.isLike);
    } catch (error) {
        if (error instanceof HttpError) {
            return error;
        }
        throw error;
    }
}, {
    body : t.Object({
        aptId: t.String(),
        isLike: t.Boolean()
    }),
    beforeHandle({ bearer, set, error }) {
        if (!bearer) {
            set.headers[
                'WWW-Authenticate'
            ] = `Bearer realm='sign', error="invalid_request"`
            return error(400, 'Unauthorized')
        }
    }
})

likeRoutes.use(bearer()).delete('/', ({ bearer, body }) => {
    try {
        if (getUser(bearer) === undefined) {
            return new HttpError('Forbidden: User not found',403);
        }
        return deleteRelation(bearer, body.aptId);
    } catch(error) {
        if (error instanceof HttpError) {
            return error;
        }
        throw error;
    }
}, {
    body : t.Object({
        aptId: t.String(),
        isLike: t.Boolean()
    }),
    beforeHandle({ bearer, set, error }) {
        if (!bearer) {
            set.headers[
                'WWW-Authenticate'
            ] = `Bearer realm='sign', error="invalid_request"`
            return error(400, 'Unauthorized')
        }
    }
})

export {likeRoutes};
