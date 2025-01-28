import Redis from "ioredis";
import { REDIS_PASSWORD_PREFIX } from "../constants";

export const validateToken = async (token: string, redis: Redis) => {
    const errors = [];
    let userDetails = null
    if (!token) {
        errors.push({
            field: 'token',
            message: 'token is required',
        });
    } else {
        userDetails = await redis.get(`${REDIS_PASSWORD_PREFIX}${token}`)
        if (!userDetails) {
            errors.push({
                field: 'token',
                message: 'token is expired or damaged',
            });
        }
    }
    return {
        errorsInToken: errors.length > 0 ? errors : null,
        userId: userDetails
    };
};