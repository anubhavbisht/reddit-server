import { withUrqlClient } from "next-urql";
import React from "react";
import { createClient } from "../../utils/createUrqlClient";
import { useRouter } from "next/router";
import { usePostQuery } from "../../graphql/generated/graphql";
import { Layout } from "../../components/Layout";
import { Box, Heading, Text, Spinner, Alert, AlertIcon, Card } from "@chakra-ui/react";
import { UserAction } from "../../components/UserAction";

const Post: React.FC = () => {
    const router = useRouter();
    const postId = typeof router.query.postId === "string" ? parseInt(router.query.postId) : -1;
    const [{ data, error, fetching }] = usePostQuery({
        pause: postId === -1,
        variables: { postId }
    });

    if (fetching) {
        return (
            <Layout>
                <Box display="flex" justifyContent="center" alignItems="center" h="70vh">
                    <Spinner size="xl" color="purple.500" />
                    <Text ml={4} fontSize="lg" fontWeight="bold" color="gray.600">
                        Loading your post...
                    </Text>
                </Box>
            </Layout>
        );
    }

    if (error) {
        console.error("Error in post page", error);
        return (
            <Layout>
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    Oops! Something went wrong. Please try again later.
                </Alert>
            </Layout>
        );
    }

    if (!data?.post) {
        return (
            <Layout>
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    No post found. It may have been deleted.
                </Alert>
            </Layout>
        );
    }

    return (
        <Layout>
            <Card
                p={8}
                boxShadow="lg"
                borderRadius="lg"
                bg="white"
                _dark={{ bg: "gray.800" }}
                maxW="700px"
                mx="auto"
                transition="all 0.3s"
                _hover={{ boxShadow: "2xl" }}
            >
                <Heading fontSize="3xl" mb={4} color="purple.600">
                    {data.post.title}
                </Heading>
                <Text fontSize="lg" color="gray.700" lineHeight="tall" mb={6}>
                    {data.post.text}
                </Text>
                <UserAction postId={data.post.id} creatorId={data.post.creatorId} />
            </Card>
        </Layout>
    );
};

export default withUrqlClient(createClient)(Post);
