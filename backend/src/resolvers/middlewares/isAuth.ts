import { Context } from "../../types";
import { MiddlewareFn } from "type-graphql";

export const isUserAuthenticated: MiddlewareFn<Context> = ({ context }, next) => {
    if (!context.req.session.userId) {
        throw new Error('Not Authenticated')
    }
    return next()
}