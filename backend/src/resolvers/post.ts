import { Context, FieldError } from "../types";
import { Post } from "../database/entities/Post";
import { Query, Resolver, Arg, Int, Mutation, InputType, Field, Ctx, UseMiddleware, ObjectType, FieldResolver, Root } from "type-graphql";
import { isUserAuthenticated } from "./middlewares/isAuth";
import { validatePost } from "./validations/validateCreatePostInputs";
import { AppDataSource } from "../database/orm.config";

@InputType()
export class PostInput {
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

    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(limit, 50)
        const hasMoreLimit = realLimit + 1
        const queryBuilder = AppDataSource
            .getRepository(Post)
            .createQueryBuilder("post")
            .orderBy('"createdAt"', "DESC")
            .limit(hasMoreLimit)
        if (cursor) {
            queryBuilder.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) })
        }
        const posts = await queryBuilder.getMany()
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

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title", () => String, { nullable: true }) title: string
    ): Promise<Post | null> {
        const post = await Post.findOne({ where: { id } });
        if (!post) {
            return null;
        }
        if (title !== undefined) {
            post.title = title;
            await post.save();
        }
        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id", () => Int) id: number
    ): Promise<boolean> {
        await Post.delete(id);
        return true
    }
}