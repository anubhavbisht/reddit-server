import React from "react"
import { Navbar } from "./Navbar"
import { Wrapper, wrapperVariants } from "./Wrapper"
import { Box } from "@chakra-ui/react"

interface layoutProps {
    variant?: wrapperVariants
    children?: React.ReactNode
}

export const Layout: React.FC<layoutProps> = ({ children, variant }) => {
    return (
        <Box backgroundColor="cyan.200">
            <Navbar />
            <Wrapper variant={variant}>
                {children}
            </Wrapper>
        </Box>
    )
}
