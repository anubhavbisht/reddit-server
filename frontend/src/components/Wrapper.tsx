import { Box } from "@chakra-ui/react";
import React from "react";

export type wrapperVariants = "small" | "regular"

interface wrapperProps {
    variant?: wrapperVariants
    children?: React.ReactNode
}

export const Wrapper: React.FC<wrapperProps> = ({ children, variant = "regular" }) => {
    return (
        <Box mt={8} w="100%" mx="auto" maxW={variant === 'regular' ? '800px' : '400px'}>
            {children}
        </Box>
    )
}