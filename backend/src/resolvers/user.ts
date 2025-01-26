import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType, Query } from "type-graphql";
import argon2 from 'argon2'
import { Context } from "src/types";
import { User } from "../database/entities/User";
import { COOKIE_NAME, REDIS_PASSWORD_PREFIX } from "../constants";
import { validateRegister } from "../utils/validateRegister";
import { validateLogin } from "../utils/validateLogin";
import { v4 } from "uuid";
import { sendMailToUser } from "../utils/sendMail";
import { validateEmail } from "../utils/validateEmail";

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

@ObjectType()
class ForgotPasswordResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]
    @Field(() => Boolean, { nullable: true })
    success?: boolean 
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
            if (e.code === '23505' && e.constraint.includes('username')) {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'username is already taken'
                        }
                    ]
                }
            } else {
                return {
                    errors: [
                        {
                            field: 'email',
                            message: 'a user already exists with this mail'
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

    @Mutation(() => ForgotPasswordResponse)
    async forgotPassword(
        @Arg('email', () => String) email: string,
        @Ctx() { em, redis }: Context): Promise<ForgotPasswordResponse> {
        const errors = validateEmail(email)
        if (errors) {
            return { errors };
        }
        const user = await em.findOne(User, {
            email
        })
        if (!user) {
            return { success: true}
        }
        const token = v4()
        await redis.set(`${REDIS_PASSWORD_PREFIX}${token}`, user.id, 'EX', 3600); // 1hr expiry for forgot password token
        await sendMailToUser(email,`<a href="http://localhost:3000/reset-password/${token}">Reset Password</a>`)
        return { success: true}
    }
}