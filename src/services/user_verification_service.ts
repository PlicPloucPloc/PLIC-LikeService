import { HttpError } from "elysia-http-error";
import { getUser } from "../data/users";

export async function verifyUser(bearer: string) : Promise<string> {
    const userId = await getUser(bearer);
    if (!userId) {
        throw HttpError.Unauthorized('User do not exist');
    }
    return userId;
}

