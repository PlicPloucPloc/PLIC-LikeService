import { HttpError } from "elysia-http-error";
import { getUser } from "../data/users";
import { getLogger } from "./logger";
import { Logger } from "winston";

const logger: Logger = getLogger('User');

export async function verifyUser(bearer: string) : Promise<string> {
    logger.info('Getting User');
    const userId = await getUser(bearer);
    if (!userId) {
        logger.error('User not found');
        throw HttpError.Unauthorized('User do not exist');
    }
    logger.info('This is fine');
    return userId;
}

