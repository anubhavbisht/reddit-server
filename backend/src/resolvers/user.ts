import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType, Query, FieldResolver, Root } from "type-graphql";
import argon2 from 'argon2'
import { Context, FieldError } from "../types";
import { User } from "../database/entities/User";
import { COOKIE_NAME, REDIS_PASSWORD_PREFIX } from "../constants";
import { validateRegister } from "./validations/validateRegister";
import { validateLogin } from "./validations/validateLogin";
import { v4 } from "uuid";
import { sendMailToUser } from "../utils/sendMail";
import { validateEmail } from "./validations/validateEmail";
import { validatePassword } from "./validations/validatePassword";
import { validateToken } from "./validations/validateToken";

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

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() { req }: Context): string {
        if(req.session.userId === user.id) {
            return user.email
        }
        return ""
    }

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req }: Context): Promise<User | null> {
        if (!req.session?.userId) {
            return null
        }
        const user = await User.findOne({ where: { id: req.session.userId } });
        return user
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options', () => RegisterInput) options: RegisterInput,
        @Ctx() { req }: Context
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
            await user.save();
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
        @Ctx() { req }: Context
    ): Promise<UserResponse> {
        const errors = validateLogin(usernameOrEmail, password)
        if (errors) {
            return { errors };
        }
        const user = await User.findOne({
            where: usernameOrEmail.includes('@')
                ? { email: usernameOrEmail }
                : { username: usernameOrEmail },
        });
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
        @Ctx() { redis }: Context): Promise<ForgotPasswordResponse> {
        const errors = validateEmail(email)
        if (errors) {
            return { errors };
        }
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return { success: true }
        }
        const token = v4()
        await redis.set(`${REDIS_PASSWORD_PREFIX}${token}`, user.id, 'EX', 3600); // 1hr expiry for forgot password token
        await sendMailToUser(email, `<a href="http://localhost:3000/reset-password/${token}">Reset Password</a>`)
        return { success: true }
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('newPassword', () => String) newPassword: string,
        @Arg('token', () => String) token: string,
        @Ctx() { req, redis }: Context): Promise<UserResponse> {
        const errorsInPassword = validatePassword(newPassword)
        if (errorsInPassword) {
            return { errors: errorsInPassword };
        }
        const { userId, errorsInToken } = await validateToken(token, redis)
        if (errorsInToken) {
            return { errors: errorsInToken };
        }
        const user = await User.findOne({ where: { id: Number(userId) } });
        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'User no longer exists'
                    }
                ]
            }
        }
        user.password = await argon2.hash(newPassword)
        await user.save();
        await redis.del(`${REDIS_PASSWORD_PREFIX}${token}`)
        req.session.userId = user.id
        return { user }
    }
}