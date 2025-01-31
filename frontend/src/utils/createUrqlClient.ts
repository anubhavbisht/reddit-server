import { Exchange, fetchExchange } from "urql"
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import { LoginMutation, MeQuery, MeDocument, RegisterMutation, LogoutMutation } from "../graphql/generated/graphql"
import { pipe, tap } from "wonka";
import Router from "next/router";

function improvedUpdateQuery<Result, Query>(cache: Cache, query: QueryInput, result: any, fn: (r: Result, q: Query) => Query) {
    return cache.updateQuery(query, data => fn(result, data as any) as any)
}

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
        updates: {
            Mutation: {
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