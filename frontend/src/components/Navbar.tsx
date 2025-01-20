import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useMeQuery } from "../graphql/generated/graphql";

interface navbarProps {

}

export const Navbar: React.FC<navbarProps> = ({ }) => {
    const [{ data, fetching }] = useMeQuery()
    let body = null
    if (!fetching) {
        if (!data?.me) {
            body = (
                <Flex>
                    <NextLink href="/login">
                        <Link mr={2}>Login</Link>
                    </NextLink>
                    <NextLink href="/register">
                        <Link>Register</Link>
                    </NextLink>
                </Flex>
            )
        } else {
            body = (
                <Flex>
                    <Box mr={2}>{data.me.username}</Box>
                    <Button
                        onClick={() => {
                            console.log('Logging out')
                        }}
                        variant="link"
                    >
                        Logout
                    </Button>
                </Flex>
            )
        }
    }
    return <Flex bg="tomato" p={4}>
        <Box ml="auto">
            {body}
        </Box>
    </Flex>
}