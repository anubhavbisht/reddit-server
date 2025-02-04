import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany, PrimaryColumn, ManyToOne } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity("UserPostVotes")
export class UserPostVotes extends BaseEntity {
    @Column({type: 'int'})
    votes: number

    @PrimaryColumn()
    userId: number

    @PrimaryColumn()
    postId: number

    @ManyToOne(() => User, (user) => user.userPostVotes)
    user: User

    @ManyToOne(() => Post, (post) => post.userPostVotes)
    post: Post
}