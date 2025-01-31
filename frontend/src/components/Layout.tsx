import React from "react"
import { Navbar } from "./Navbar"
import { Wrapper, wrapperVariants } from "./Wrapper"

interface layoutProps {
    variant?: wrapperVariants
    children?: React.ReactNode
}

export const Layout: React.FC<layoutProps> = ({ children, variant }) => {
    return (
        <>
            <Navbar />
            <Wrapper variant={variant}>
                {children}
            </Wrapper></>
    )
}
