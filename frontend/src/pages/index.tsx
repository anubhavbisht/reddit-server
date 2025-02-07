import { Box, Button, Flex, Heading, IconButton, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { Votes } from "../components/Votes";
import { useDeletePostMutation, usePostsQuery } from "../graphql/generated/graphql";
import { createClient } from "../utils/createUrqlClient";
import { convertToIST } from "../utils/dateFormatter";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

const Index = () => {
  const [postVariables, setPostVariables] = useState({
    limit: 10,
    cursor: null as null | string
  })
  const [{ data, fetching }] = usePostsQuery({
    variables: postVariables
  })
  const [_, deletePost] = useDeletePostMutation()
  if (!data && !fetching) {
    return <div>No feeder posts</div>
  }

  return (
    <Layout>
      <Flex mb="5" align="center" justifyContent={"space-between"}>
        <Heading fontSize="2xl">All Posts</Heading>
        <NextLink href="/create-post" passHref>
          <Button
            size="lg"
            bgGradient="linear(to-r, purple.500, pink.500)"
            color="white"
            fontWeight="bold"
            leftIcon={<AddIcon />}
            _hover={{
              bgGradient: "linear(to-r, purple.600, pink.600)",
              transform: "scale(1.05)",
              boxShadow: "lg",
            }}
            _active={{
              transform: "scale(0.95)",
            }}
            transition="all 0.2s ease-in-out"
          >
            Create Post ✍🏼
          </Button>
        </NextLink>
      </Flex>
      {!data && fetching ? <div>Loading posts......</div> :
        (<Stack spacing={8}>
          {
            data?.posts?.posts.map((p) => !p ? null : (
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px" alignItems={"center"} backgroundColor="honeydew">
                <Votes post={p} />
                <Box flex={"1"}>
                  <NextLink href="/post/[postId]" as={`/post/${p.id}`}>
                    <Heading fontSize="xl" cursor="pointer" transition="all 0.3s" _hover={{ textDecoration: "underline" }}>{p.title}</Heading>
                  </NextLink>
                  <Heading fontSize="md" color="blue.400">{convertToIST(p.createdAt)}</Heading>
                  <Heading fontSize="sm" color="purple.400">Posted by {p.creator.username}</Heading>
                  <Flex mt="4" align={"center"}>
                    <Text>{p.textSnippet}</Text>
                    <IconButton
                      aria-label="delete-post"
                      icon={<DeleteIcon />}
                      size="lg"
                      colorScheme="red"
                      ml="auto"
                      onClick={async () => {
                        await deletePost({
                          id: p.id
                        })
                      }}
                    />
                  </Flex>
                </Box>
              </Flex>
            ))
          }
        </Stack>)}
      {data && data.posts.hasMore ? <Flex><Button
        onClick={() => {
          setPostVariables({
            limit: postVariables.limit,
            cursor: data?.posts?.posts[data.posts.posts.length - 1]?.createdAt,
          });
        }}
        isLoading={fetching}
        size="lg"
        variant="solid"
        bgGradient="linear(to-r, purple.500, pink.500)"
        color="white"
        fontWeight="bold"
        borderRadius="full"
        px={6}
        py={3}
        _hover={{
          bgGradient: "linear(to-r, purple.600, pink.600)",
          transform: "scale(1.05)",
          boxShadow: "xl",
        }}
        _active={{
          transform: "scale(0.95)",
        }}
        transition="all 0.2s ease-in-out"
        m="auto"
        my="8"
      >
        🔄 Load More
      </Button>
      </Flex> : null}
    </Layout>
  )
};

export default withUrqlClient(createClient, { ssr: false })(Index);
