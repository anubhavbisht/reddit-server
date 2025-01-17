import { Post } from "../database/entities/Post";
import { Context } from "../types";
import { Query, Resolver, Ctx, Arg, Int, Mutation } from "type-graphql";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(@Ctx() { em }: Context): Promise<Post[]> {
        const posts = await em.findAll(Post, {}) as Post[]
        return posts
    }

    @Query(() => Post, { nullable: true })
    async post(
        @Arg("id", () => Int) id: number,
        @Ctx() { em }: Context): Promise<Post | null> {
        const post = await em.findOne(Post, {
            id
        }) as Post
        return post
    }

    @Mutation(() => Post)
    async createPost(
        @Arg("title", () => String) title: string,
        @Ctx() { em }: Context): Promise<Post> {
        const newPost = new Post()
        newPost.title = title
        await em.persistAndFlush(newPost)
        return newPost
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("title", () => String, { nullable: true }) title: string,
        @Ctx() { em }: Context): Promise<Post | null> {
        const post = await em.findOne(Post, {
            id
        }) as Post
        if (!post) {
            return null
        }
        if (typeof title !== undefined) {
            post.title = title
            await em.persistAndFlush(post)
        }
        return post
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id", () => Int) id: number,
        @Ctx() { em }: Context): Promise<boolean> {
        await em.nativeDelete(Post, { id })
        return true
    }
}