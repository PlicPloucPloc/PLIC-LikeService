import { connectToRedis } from "../libs/redis";

export async function cacheRecommendedApartments(userId: string, apartmentIds : string[]): Promise<void> {
    try {
        const redisClient = await connectToRedis();
        for (const id of apartmentIds) {
            await redisClient.rPush(userId, id);
        }
        await redisClient.expire(userId, 3600); // Cache expires in 1 hour
        console.log(`Cached recommended apartments for user ${userId}`);
        redisClient.quit();
    } catch (err) {
        console.error('Failed to cache recommended apartments: ', err);
        throw err;
    }
}

export async function popCachedApartment(userId: string): Promise<number | null> {
    try {
        const redisClient = await connectToRedis();
        const apt = await redisClient.lPop(userId) as number | null;
        redisClient.quit();
        return apt ? apt : null;
    } catch (err) {
        console.error('Failed to pop cached apartment: ', err);
        throw err;
    }
}
