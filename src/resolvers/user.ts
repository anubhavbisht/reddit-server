import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType, Query } from "type-graphql";
import argon2 from 'argon2'
import { Context } from "src/types";
import { User } from "../database/entities/User";

@InputType()
class RegisterInput {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]
    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { em, req }: Context): Promise<User | null> {
        if (!req.session?.userId) {
            return null
        }
        const user = await em.findOne(User, {
            id: req.session.userId
        })
        return user
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options', () => RegisterInput) options: RegisterInput,
        @Ctx() { em, req }: Context
    ): Promise<UserResponse> {
        const { username, password } = options
        if (username.length <= 2) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'username length is less than 2'
                    }
                ]
            }
        }
        if (password.length <= 2) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'password length is less than 2'
                    }
                ]
            }
        }
        const user = new User()
        user.username = username
        user.password = await argon2.hash(password)
        try {
            await em.persistAndFlush(user)
        } catch (e) {
            if (e.code === '23505') {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'username is already taken'
                        }
                    ]
                }
            }
        }
        req.session.userId = user.id
        return { user }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options', () => RegisterInput) options: RegisterInput,
        @Ctx() { em, req }: Context
    ): Promise<UserResponse> {
        const { username, password } = options
        if (username.length <= 2) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'username length is less than 2'
                    }
                ]
            }
        }
        if (password.length <= 2) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'password length is less than 2'
                    }
                ]
            }
        }
        const user = await em.findOne(User, {
            username
        }) as User
        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: "user does not exist"
                    }
                ]
            }
        }
        const verify = await argon2.verify(user.password, password)
        if (!verify) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: "password does not match"
                    }
                ]
            }
        }
        req.session.userId = user.id
        return { user }
    }
}