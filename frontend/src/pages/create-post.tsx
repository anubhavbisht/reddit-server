import { withUrqlClient } from "next-urql"
import React from "react"
import { createClient } from "../utils/createUrqlClient"
import { useRouter } from "next/router"
import { Box, Button } from "@chakra-ui/react"
import { Formik, Form } from "formik"
import { FormInputField } from "../components/FormInputField"
import { mapError } from "../utils/mapError"
import { useCreatePostMutation } from "../graphql/generated/graphql"
import { Layout } from "../components/Layout"
import { isUserAuthorized } from "../utils/useAuthHook"

interface createPostProps {

}

const CreatePost: React.FC<createPostProps> = ({ }) => {
    const router = useRouter()
    isUserAuthorized()
    const [_, createPost] = useCreatePostMutation()
    return (
        <Layout variant="small">
            <Formik
                initialValues={{ title: '', text: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const { data, error } = await createPost({ options: values })
                    if (data && !error) {
                        if (data?.createPost.errors) {
                            setErrors(mapError(data.createPost.errors))
                        } else {
                            router.push('/')
                        }
                    }
                }}
            >
                {(props) => (
                    <Form>
                        <FormInputField name="title" label="Title" placeholder="Enter your post's title" />
                        <Box mt={4}>
                            <FormInputField isTextArea name="text" label="Text" placeholder="Enter your post's content" />
                        </Box>
                        <Button
                            mt={4}
                            colorScheme='teal'
                            isLoading={props.isSubmitting}
                            type='submit'
                        >
                            Submit post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    )
}

export default withUrqlClient(createClient)(CreatePost)