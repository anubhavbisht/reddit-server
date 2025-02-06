import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../graphql/generated/graphql";

interface navbarProps {

}

export const Navbar: React.FC<navbarProps> = ({ }) => {
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation()
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
                            logout({})
                        }}
                        isLoading={logoutFetching}
                        variant="link"
                    >
                        Logout
                    </Button>
                </Flex>
            )
        }
    }
    return <Flex zIndex={1} position={"sticky"} top={0} bg="tomato" p={4} align={"center"}>
        <NextLink href="/">
            <Heading fontSize="4xl" cursor="pointer" transition="all 0.3s" _hover={{ textDecoration: "underline" }}>Feeder</Heading>
        </NextLink>
        <Box ml="auto">
            {body}
        </Box>
    </Flex>
}