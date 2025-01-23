import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React from "react";
import { Wrapper } from "../components/Wrapper";
import { FormInputField } from "../components/FormInputField";
import { useLoginMutation } from "../graphql/generated/graphql";
import { useRouter } from "next/router";
import { mapError } from "../utils/mapError";
import { withUrqlClient } from "next-urql";
import { createClient } from "../utils/createUrqlClient";

interface loginProps {

}

const Login: React.FC<loginProps> = ({ }) => {
    const [_, loginUser] = useLoginMutation()
    const router = useRouter()
    return (
        <Wrapper>
            <Formik
                initialValues={{ usernameOrEmail: '', password: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const result = await loginUser(values)
                    if (result.data?.login.errors) {
                        setErrors(mapError(result.data.login.errors))
                    } else {
                        router.push('/')
                    }
                }}
            >
                {(props) => (
                    <Form>
                        <FormInputField name="usernameOrEmail" label="Username or Email" placeholder="Enter your username or email" />
                        <Box mt={4}>
                            <FormInputField name="password" label="Password" placeholder="Enter your password" type="password" />
                        </Box>
                        <Button
                            mt={4}
                            colorScheme='teal'
                            isLoading={props.isSubmitting}
                            type='submit'
                        >
                            Login
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createClient)(Login)