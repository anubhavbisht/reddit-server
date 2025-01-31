import { Field, ObjectType } from "type-graphql";
import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";
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

    @ManyToOne(() => User, (user) => user.posts)
    creator: User

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}