import React, { useState } from "react";
import { Flex, IconButton } from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { RegularPostFragment, useVoteMutation } from "../graphql/generated/graphql";

interface votesProps {
    post: RegularPostFragment
}

export const Votes: React.FC<votesProps> = ({ post }) => {
    const [votingStatus, changeVotingStatus] = useState<'not-loading' | 'upvote-loading' | 'downvote-loading'>('not-loading')
    const [, vote] = useVoteMutation()
    return (
        <Flex direction="column" justifyContent="center" alignItems="center" mr="4">
            <IconButton
                aria-label="upvote-post"
                icon={<ChevronUpIcon />}
                size="lg"
                colorScheme="green"
                variant="outline"
                border="1px solid"
                _hover={{ bg: "green.100" }}
                onClick={async () => {
                    changeVotingStatus('upvote-loading')
                    await vote({
                        postId: post.id,
                        vote: 1
                    })
                    changeVotingStatus('not-loading')
                }}
                isLoading={votingStatus === 'upvote-loading'}
            />
            {post.points}
            <IconButton
                aria-label="downvote-post"
                icon={<ChevronDownIcon />}
                size="lg"
                colorScheme="red"
                variant="outline"
                border="1px solid"
                _hover={{ bg: "red.100" }}
                onClick={async () => {
                    changeVotingStatus('downvote-loading')
                    await vote({
                        postId: post.id,
                        vote: -1
                    })
                    changeVotingStatus('not-loading')
                }}
                isLoading={votingStatus === 'downvote-loading'}
            />
        </Flex>
    );
}