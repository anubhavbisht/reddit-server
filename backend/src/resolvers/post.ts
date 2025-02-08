import { Context, FieldError } from "../types";
import { Post } from "../database/entities/Post";
import { Query, Resolver, Arg, Int, Mutation, InputType, Field, Ctx, UseMiddleware, ObjectType, FieldResolver, Root } from "type-graphql";
import { isUserAuthenticated } from "./middlewares/isAuth";
import { validatePost } from "./validations/validateCreatePostInputs";
import { AppDataSource } from "../database/orm.config";
import { QueryRunner } from "typeorm";
import { UserPostVotes } from "../database/entities/UserPostVotes";
import { User } from "../database/entities/User";

@InputType()
export class PostInput {
    @Field({ nullable: true })
    id?: number
    @Field()
    text: string
    @Field()
    title: string
}

@ObjectType()
class PostResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]
    @Field(() => Post, { nullable: true })
    post?: Post
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[]
    @Field(() => Boolean)
    hasMore: boolean
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() post: Post): string {
        return post.text.slice(0, 100) + '....'
    }

    @FieldResolver(() => User)
    async creator(@Root() post: Post,
        @Ctx() { userLoader }: Context): Promise<User> {
        return userLoader.load(post.creatorId)
    }

    @FieldResolver(() => Number, { nullable: true })
    async currentUserVoteStatus(@Root() post: Post,
        @Ctx() { req, userVoteLoader }: Context): Promise<Number | null> {
        if (!req.session.userId) return null;
        return userVoteLoader.load({ userId: req.session.userId, postId: post.id });
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(limit, 50)
        const hasMoreLimit = realLimit + 1
        const queryRunner: QueryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        const replacements: any[] = [];
        let index = 1;
        replacements.push(hasMoreLimit);
        let cursorIndex: number | null = null;
        if (cursor) {
            cursorIndex = ++index;
            replacements.push(new Date(parseInt(cursor)));
        }
        const postQuery = `
        SELECT
            "Post".*
        FROM "Post"
        ${cursorIndex ? `WHERE "Post"."createdAt" < $${cursorIndex}` : ''}
        ORDER BY "Post"."createdAt" DESC
        LIMIT $1
        `;

        const posts = await queryRunner.query(postQuery, replacements);

        await queryRunner.release()
        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === hasMoreLimit
        }
    }

    @Query(() => Post, { nullable: true })
    async post(
        @Arg("id", () => Int) id: number
    ): Promise<Post | null> {
        const post = await Post.findOne({ where: { id } }) as Post
        return post
    }

    @Mutation(() => PostResponse)
    @UseMiddleware(isUserAuthenticated)
    async createPost(
        @Arg("options", () => PostInput) options: PostInput,
        @Ctx() { req }: Context
    ): Promise<PostResponse> {
        const errors = validatePost(options)
        if (errors) {
            return { errors };
        }
        const { text, title } = options
        const newPost = Post.create({ title, text, creatorId: req.session.userId });
        await newPost.save();
        return {
            post: newPost
        };
    }


    @Mutation(() => PostResponse, { nullable: true })
    @UseMiddleware(isUserAuthenticated)
    async updatePost(
        @Arg("options", () => PostInput) options: PostInput,
        @Ctx() { req }: Context
    ): Promise<PostResponse | null> {
        const errors = validatePost(options)
        if (errors) {
            return { errors };
        }
        const { id, text, title } = options
        const updatedPost = await Post.findOne({ where: { id, creatorId: req.session.userId } });
        if (!updatedPost) {
            return null;
        }
        if (title !== undefined) {
            updatedPost.title = title;
        }
        if (text !== undefined) {
            updatedPost.text = text
        }
        await updatedPost.save();
        return {
            post: updatedPost
        };
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isUserAuthenticated)
    async deletePost(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: Context
    ): Promise<boolean> {
        await Post.delete({ id, creatorId: req.session.userId });
        return true
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isUserAuthenticated)
    async vote(
        @Arg("postId", () => Int) postId: number,
        @Arg("vote", () => Int) vote: number,
        @Ctx() { req }: Context
    ): Promise<boolean> {
        const { userId } = req.session
        const isUpvote = vote !== -1
        const voteValue = isUpvote ? 1 : -1
        const userPostVote = await UserPostVotes.findOne({
            where: {
                userId,
                postId
            }
        })
        if (userPostVote && userPostVote.votes === voteValue) {
            return true
        }
        const queryRunner: QueryRunner = AppDataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            if (!userPostVote) {
                await queryRunner.query(`
                    insert into
                        "UserPostVotes" ("userId", "postId", "votes")
                    values
                        ($1, $2, $3) 
                    `, [userId, postId, voteValue])
                await queryRunner.query(`
                    update "Post"
                    set
                        "points" = "points" + $1
                    where
                        "id" = $2
                    `, [voteValue, postId])
            } else {
                await queryRunner.query(`
                    update "UserPostVotes" 
                    set "votes" = $1
                    where "postId" = $2 and "userId" = $3
                    `, [voteValue, postId, userId])
                await queryRunner.query(`
                    update "Post"
                    set
                        "points" = "points" + $1
                    where
                        "id" = $2
                    `, [2 * voteValue, postId])
            }
            await queryRunner.commitTransaction()
        } catch (e) {
            console.error("Transaction failed: ", e);
            await queryRunner.rollbackTransaction()
        } finally {
            await queryRunner.release()
        }
        return true
    }
}