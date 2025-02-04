import { withUrqlClient } from "next-urql";
import { createClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../graphql/generated/graphql";
import { convertToIST } from "../utils/dateFormatter";
import { Layout } from "../components/Layout";
import NextLink from "next/link";
import { Box, Heading, Stack, Text, Flex, Button } from "@chakra-ui/react";
import { useState } from "react";

const Index = () => {
  const [postVariables, setPostVariables] = useState({
    limit: 10,
    cursor: null as null | string
  })
  const [{ data, fetching }] = usePostsQuery({
    variables: postVariables
  })

  if (!data && !fetching) {
    return <div>No feeder posts</div>
  }

  return (
    <Layout>
      <Flex mb="5" align="center" justifyContent={"space-between"}>
        <Heading>Shit Post</Heading>
        <NextLink href="/create-post">
          <Text color="purple.700" fontSize="md" fontWeight="bold" cursor="pointer" transition="all 0.3s"
            _hover={{ color: "purple.500", textDecoration: "underline" }}
            _active={{ color: "purple.900" }}>
            🆕 Create Post ✍🏼
          </Text>
        </NextLink>
      </Flex>
      {!data && fetching ? <div>Loading posts......</div> :
        (<Stack spacing={8}>
          {
            data?.posts?.posts.map((p) => (
              <Box key={p.id} p={5} shadow="md" borderWidth="1px">
                <Heading fontSize="xl">{p.title}</Heading>
                <Heading fontSize="md" color="blue.400">{convertToIST(p.createdAt)}</Heading>
                <Text mt="4">{p.textSnippet}</Text>
              </Box>
            ))
          }
        </Stack>)}
      {data && data.posts.hasMore ? <Flex><Button onClick={() => {
        setPostVariables({
          limit: postVariables.limit,
          cursor: data?.posts?.posts[data.posts.posts.length - 1]?.createdAt
        })
      }} isLoading={fetching} m="auto" my="8">Load more</Button></Flex> : null}
    </Layout>
  )
};

export default withUrqlClient(createClient, { ssr: false })(Index);
