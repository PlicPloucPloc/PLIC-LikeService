import Elysia, { t } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { addRelation, deleteRelation, updateRelation } from "../services/likeService";

const likeRoutes = new Elysia({prefix: "/relations"});

likeRoutes.use(bearer()).get('/all', ({ bearer }) => {
    return getAllRealtions(bearer);
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

likeRoutes.use(bearer()).get('/likes/:isFilterColoc', ({ bearer }) => {
    return getAllLikes(bearer);
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

likeRoutes.use(bearer()).post('/', ({ bearer, body }) => {
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

likeRoutes.use(bearer()).put('/', ({ bearer, body }) => {
    console.log("Trying to update");
    return updateRelation(bearer, body.aptId, body.isLike);
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
    return deleteRelation(bearer, body.aptId);
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
    function getAllLikes(bearer: any): any {
        throw new Error("Function not implemented.");
    }
function getAllRealtions(bearer: any): any {
    throw new Error("Function not implemented.");
}
