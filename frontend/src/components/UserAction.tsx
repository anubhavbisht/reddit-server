import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useDeletePostMutation, useMeQuery } from "../graphql/generated/graphql";
import { Layout } from "./Layout";

interface userActionProps {
    postId: number
    creatorId: number
}

export const UserAction: React.FC<userActionProps> = ({ postId, creatorId }) => {
    const [_, deletePost] = useDeletePostMutation()
    const [{ data, fetching }] = useMeQuery()
    if (fetching) {
        return <Layout>
            <Box>Loading...</Box>
        </Layout>
    }
    if (data?.me?.id !== creatorId) {
        return null
    }
    return (
        <Flex ml="auto" align={"center"}>
            <NextLink href="/update-post/[postId]" as={`/update-post/${postId}`} passHref>
                <IconButton
                    aria-label="update-post"
                    icon={<EditIcon />}
                    size="md"
                    colorScheme="yellow"
                    ml="auto"
                    mr="2"
                />
            </NextLink>
            <IconButton
                aria-label="delete-post"
                icon={<DeleteIcon />}
                size="md"
                colorScheme="red"
                ml="auto"
                onClick={async () => {
                    await deletePost({
                        id: postId
                    })
                }}
            />
        </Flex>
    )
}