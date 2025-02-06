import { withUrqlClient } from "next-urql";
import React from "react";
import { createClient } from "../../utils/createUrqlClient";
import { useRouter } from "next/router";
import { usePostQuery } from "../../graphql/generated/graphql";
import { Layout } from "../../components/Layout";
import { Box, Heading } from "@chakra-ui/react";

interface postProps {

}

const Post: React.FC<postProps> = ({ }) => {
    const router = useRouter()
    const postId = typeof (router.query.postId) === 'string' ? parseInt(router.query.postId) : -1
    const [{ data, error, fetching }] = usePostQuery({
        pause: postId === -1,
        variables: {
            postId
        }
    })
    if (fetching) {
        return (
            <Layout>
                <Box>Loading your post</Box>
            </Layout>
        )
    }
    if (!data?.post) {
        return (
            <Layout>
                <Box>No post found</Box>
            </Layout>
        )
    }
    if (error) {
        console.log('Error in post page', error)
        return (
            <Layout>
                <Box>Some error</Box>
            </Layout>
        )
    }
    return (
        <Layout>
            <Heading fontSize="2xl" mb={4}>{data.post.title}</Heading>
            {data.post.text}
        </Layout>
    )
}

export default withUrqlClient(createClient)(Post)