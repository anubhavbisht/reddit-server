import { Post } from "../database/entities/Post";
import { Query, Resolver, Arg, Int, Mutation } from "type-graphql";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(): Promise<Post[]> {
        const posts = await Post.find()
        return posts
    }

    @Query(() => Post, { nullable: true })
    async post(
        @Arg("id", () => Int) id: number
    ): Promise<Post | null> {
        const post = await Post.findOne({ where: { id } }) as Post
        return post
    }

    @Mutation(() => Post)
    async createPost(
        @Arg("title", () => String) title: string): Promise<Post> {
        const newPost = Post.create({ title });
        await newPost.save();
        return newPost;
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