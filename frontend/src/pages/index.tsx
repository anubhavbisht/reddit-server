import { withUrqlClient } from "next-urql";
import { createClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../graphql/generated/graphql";
import { convertToIST } from "../utils/dateFormatter";
import { Layout } from "../components/Layout";
import NextLink from "next/link";
import { Text } from "@chakra-ui/react";

const Index = () => {
  const [{ data, fetching }] = usePostsQuery()
  return (
    <Layout>
      <NextLink href="/create-post">
        <Text color="purple.700" fontSize="md" fontWeight="bold" cursor="pointer" transition="all 0.3s"
          _hover={{ color: "purple.500", textDecoration: "underline" }}
          _active={{ color: "purple.900" }}>
          🆕 Create Post ✍🏼
        </Text>
      </NextLink>
      {!fetching && !data ? <div>Loading......</div> : data?.posts.map((p) => {
        return (<div key={p.id}>{p.title} {convertToIST(p.createdAt)}</div>)
      })}
    </Layout>
  )
};

export default withUrqlClient(createClient, { ssr: false })(Index);
