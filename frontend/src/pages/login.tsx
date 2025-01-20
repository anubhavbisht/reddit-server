import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React from "react";
import { Wrapper } from "../components/Wrapper";
import { FormInputField } from "../components/FormInputField";
import { useLoginMutation } from "../graphql/generated/graphql";
import { useRouter } from "next/router";
import { mapError } from "../utils/mapError";

interface loginProps {

}

const Login: React.FC<loginProps> = ({ }) => {
    const [_, loginUser] = useLoginMutation()
    const router = useRouter()
    return (
        <Wrapper>
            <Formik
                initialValues={{ username: '', password: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const result = await loginUser({ options: values })
                    if (result.data?.login.errors) {
                        setErrors(mapError(result.data.login.errors))
                    } else {
                        router.push('/')
                    }
                }}
            >
                {(props) => (
                    <Form>
                        <FormInputField name="username" label="Username" placeholder="Enter your username" />
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

export default Login