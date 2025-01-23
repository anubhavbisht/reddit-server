import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType, Query } from "type-graphql";
import argon2 from 'argon2'
import { Context } from "src/types";
import { User } from "../database/entities/User";
import { COOKIE_NAME } from "../constants";
import { validateRegister } from "../utils/validateRegister";
import { validateLogin } from "../utils/validateLogin";

@InputType()
export class RegisterInput {
    @Field()
    username: string
    @Field()
    email: string
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
        const { username, password, email } = options
        const errors = validateRegister(options)
        if (errors) {
            return {
                errors
            }
        }
        const user = new User()
        user.username = username
        user.email = email
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
        @Arg('usernameOrEmail', () => String) usernameOrEmail: string,
        @Arg('password', () => String) password: string,
        @Ctx() { em, req }: Context
    ): Promise<UserResponse> {
        const errors = validateLogin(usernameOrEmail, password)
        if (errors) {
            return { errors };
        }
        const user = await em.findOne(User, usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail }) as User
        if (!user) {
            return {
                errors: [
                    {
                        field: 'usernameOrEmail',
                        message: "user with this username or emailId does not exist"
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

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: Context): Promise<boolean> {
        return new Promise((resolve) => {
            req.session.destroy((err) => {
                if (err) {
                    resolve(false)
                } else {
                    res.clearCookie(COOKIE_NAME)
                    resolve(true)
                }
            })
        })
    }

    @Mutation(() => Boolean)
    forgotPassword(@Ctx() { req: _, res: __ }: Context): Promise<boolean> {
        return new Promise((resolve) => {
            resolve(true)
        })
    }
}