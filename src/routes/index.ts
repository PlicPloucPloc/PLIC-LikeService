import Elysia, { t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { addRelation } from "../services/likeService";

const likeRoutes = new Elysia({prefix: "/relations"});

likeRoutes.use(bearer()).get('/all', ({ bearer }) => bearer, {
    beforeHandle({ bearer, set, error }) {
        if (!bearer) {
            set.headers[
                'WWW-Authenticate'
            ] = `Bearer realm='sign', error="invalid_request"`

            return error(400, 'Unauthorized')
        }
    }
})

likeRoutes.use(bearer()).get('/likes/:isFilterColoc', ({ bearer }) => bearer, {
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

likeRoutes.use(bearer()).post('/', ({ bearer, body }) => {
    console.log("Trying to like: " + bearer);
    addRelation(bearer, body.aptId, body.isLike);
    return "OK";
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

likeRoutes.use(bearer()).put('/', ({ bearer, body }) => bearer + body, {
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
