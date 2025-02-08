import { withUrqlClient } from "next-urql"
import React from "react"
import { createClient } from "../utils/createUrqlClient"
import { Post } from "../components/Post"

interface createPostProps {

}

const CreatePost: React.FC<createPostProps> = ({ }) => {
    return (
        <Post title="" text="" />
    )
}

export default withUrqlClient(createClient)(CreatePost)