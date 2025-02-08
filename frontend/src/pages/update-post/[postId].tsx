import { withUrqlClient } from "next-urql"
import React from "react"
import { createClient } from "../../utils/createUrqlClient"
import { Post } from "../../components/Post"
import { useRouter } from "next/router"
import { Box } from "@chakra-ui/react"
import { usePostQuery } from "../../graphql/generated/graphql"
import { Layout } from "../../components/Layout"

interface updatePostProps {

}

const UpdatePost: React.FC<updatePostProps> = ({ }) => {
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
        <Post title={data.post.title} text={data.post.text} id={data.post.id} />
    )
}

export default withUrqlClient(createClient)(UpdatePost)