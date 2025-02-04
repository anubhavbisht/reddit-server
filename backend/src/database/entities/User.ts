import { Field, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { Post } from "./Post";
import { UserPostVotes } from "./UserPostVotes";

@ObjectType()
@Entity("User")
export class User extends BaseEntity {
    @Field(() => Number)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column({ unique: true })
    username!: string;

    @Field(() => String)
    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @OneToMany(() => Post, (post) => post.creator)
    posts: Post[]

    @OneToMany(() => UserPostVotes, (userPostVotes) => userPostVotes.user)
    userPostVotes: UserPostVotes[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}