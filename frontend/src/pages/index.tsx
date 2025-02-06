import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { Votes } from "../components/Votes";
import { usePostsQuery } from "../graphql/generated/graphql";
import { createClient } from "../utils/createUrqlClient";
import { convertToIST } from "../utils/dateFormatter";

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
        <Heading fontSize="2xl">All Posts</Heading>
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
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px" alignItems={"center"}>
                <Votes post={p} />
                <Box>
                  <NextLink href="/post/[postId]" as={`/post/${p.id}`}>
                    <Heading fontSize="xl" cursor="pointer" transition="all 0.3s" _hover={{ textDecoration: "underline" }}>{p.title}</Heading>
                  </NextLink>
                  <Heading fontSize="md" color="blue.400">{convertToIST(p.createdAt)}</Heading>
                  <Heading fontSize="sm" color="purple.400">Posted by {p.creator.username}</Heading>
                  <Text mt="4">{p.textSnippet}</Text>
                </Box>
              </Flex>
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
