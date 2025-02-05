import { Exchange, fetchExchange, stringifyVariables } from "urql"
import { cacheExchange, Cache, QueryInput, Resolver } from '@urql/exchange-graphcache';
import { LoginMutation, MeQuery, MeDocument, RegisterMutation, LogoutMutation, VoteMutationVariables } from "../graphql/generated/graphql"
import { pipe, tap } from "wonka";
import Router from "next/router";
import { gql } from '@urql/core';

function improvedUpdateQuery<Result, Query>(cache: Cache, query: QueryInput, result: any, fn: (r: Result, q: Query) => Query) {
    return cache.updateQuery(query, data => fn(result, data as any) as any)
}

const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;
        const allFields = cache.inspectFields(entityKey);
        const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);

        if (fieldInfos.length === 0) {
            return undefined;
        }

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
        const isItInTheCache = cache.resolve(
            cache.resolve(entityKey, fieldKey) as string,
            "posts"
        );
        info.partial = !isItInTheCache
        let result: any[] = [];
        let hasMore = true;
        fieldInfos.forEach((fi) => {
            const key = cache.resolve(entityKey, fi.fieldKey) as string;
            const data = cache.resolve(key, "posts") as string[];
            const _hasMore = cache.resolve(key, "hasMore");
            if (!_hasMore) {
                hasMore = _hasMore as boolean;
            }
            if (data) {
                result.push(...data);
            }
        });
        return {
            __typename: "PaginatedPosts",
            hasMore,
            posts: result,
        };
    };
};

const errorExchange: Exchange = ({ forward }) => (ops$) => {
    return pipe(
        forward(ops$),
        tap(({ error }) => {
            if (error?.message.includes("Not Authenticated")) {
                Router.replace("/login");
            }
        })
    );
};

export const createClient = (ssrExchange: any) => ({
    url: 'http://localhost:8000/graphql',
    exchanges: [cacheExchange({
        resolvers: {
            Query: {
                posts: cursorPagination(),
            },
        },
        updates: {
            Mutation: {
                vote: (_result, args, cache, info) => {
                    const { postId, vote } = args as VoteMutationVariables
                    const data = cache.readFragment(
                        gql`
                          fragment _ on Post {
                            id
                            points
                            currentUserVoteStatus
                          }
                        `,
                        { id: postId } as any
                    )
                    if (data) {
                        if (data.currentUserVoteStatus === vote) {
                            return
                        }
                        const newPoints = (data.points as number) + (!data.currentUserVoteStatus ? 1 : 2) * vote
                        cache.writeFragment(
                            gql`
                              fragment __ on Post {
                                points
                                currentUserVoteStatus
                              }
                            `,
                            { id: postId, points: newPoints, currentUserVoteStatus: vote }
                        );
                    }
                },
                createPost: (_result, args, cache, info) => {
                    const allFields = cache.inspectFields('Query')
                    const fieldInfos = allFields.filter((info) => info.fieldName === 'posts');
                    fieldInfos.forEach((fi) => {
                        cache.invalidate('Query', "posts", fi.arguments || {})
                    });
                },
                login: (_result, args, cache, info) => {
                    improvedUpdateQuery<LoginMutation, MeQuery>(cache, { query: MeDocument }, _result, (result, query) => {
                        if (result.login.errors) {
                            return query
                        } else {
                            return {
                                me: result.login.user
                            }
                        }
                    })
                },
                register: (_result, args, cache, info) => {
                    improvedUpdateQuery<RegisterMutation, MeQuery>(cache, { query: MeDocument }, _result, (result, query) => {
                        if (result.register.errors) {
                            return query
                        } else {
                            return {
                                me: result.register.user
                            }
                        }
                    })
                },
                logout: (_result, args, cache, info) => {
                    improvedUpdateQuery<LogoutMutation, MeQuery>(cache, { query: MeDocument }, _result, () => {
                        return {
                            me: null
                        }
                    })
                },
            },
        }
    }), errorExchange, ssrExchange, fetchExchange],
    fetchOptions: {
        credentials: "include" as const
    }
})