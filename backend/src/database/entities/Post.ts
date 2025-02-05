import { Field, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { UserPostVotes } from "./UserPostVotes";

@ObjectType()
@Entity("Post")
export class Post extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column()
    title!: string;

    @Field(() => String)
    @Column()
    text!: string;

    @Field(() => Number)
    @Column({ type: "int", default: 0 })
    points!: number;

    @Field(() => Number)
    @Column()
    creatorId!: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.posts)
    creator: User

    @OneToMany(() => UserPostVotes, (userPostVotes) => userPostVotes.post)
    userPostVotes: UserPostVotes[];

    @Field(() => Number, { nullable: true })
    currentUserVoteStatus: number | null

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}