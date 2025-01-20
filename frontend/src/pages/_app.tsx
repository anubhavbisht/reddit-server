import { ChakraProvider } from "@chakra-ui/react";
import theme from "../theme";
import { AppProps } from "next/app";
import { Client, Provider, fetchExchange } from 'urql';
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache';
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from "../graphql/generated/graphql";

function improvedUpdateQuery<Result, Query>(cache: Cache, query: QueryInput, result: any, fn: (r: Result, q: Query) => Query) {
  return cache.updateQuery(query, data => fn(result, data as any) as any)
}

const client = new Client({
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
      },
    }
  }), fetchExchange],
  fetchOptions: {
    credentials: "include"
  }
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
