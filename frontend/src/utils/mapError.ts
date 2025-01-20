import { FieldError } from "../graphql/generated/graphql";

export const mapError = (errors: FieldError[]) => {
    const errMap: Record<string, string> = {}
    errors.forEach(({ field, message }) => {
        errMap[field] = message
    })
    return errMap
}