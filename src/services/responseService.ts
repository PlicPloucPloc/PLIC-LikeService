import { HttpError } from "elysia-http-error";

export function handleMissingBearer(set: any) : Response {
    set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`;
    return handleResponse(`{message: \"Bearer not found or invalid"}`, 401);
}

export function handleError(error: any) : Response {
    if (error instanceof HttpError ) {
        return handleResponse(`{"Error": "${error.message}"}`, error.statusCode);
    }
    return handleResponse(`{"Server Error": "${error.message}"}`, 500);
}

export function handleResponse(content: string | null, status: number){
    return new Response(content, {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}
