import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity("UserPostVotes")
export class UserPostVotes extends BaseEntity {
    @Column({ type: 'int' })
    votes: number

    @PrimaryColumn()
    userId: number

    @PrimaryColumn()
    postId: number

    @ManyToOne(() => User, (user) => user.userPostVotes, {
        onDelete: "CASCADE"
    })
    user: User

    @ManyToOne(() => Post, (post) => post.userPostVotes, {
        onDelete: "CASCADE"
    })
    post: Post
}