import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React from "react";
import { Wrapper } from "../components/Wrapper";
import { FormInputField } from "../components/FormInputField";
import { useRegisterMutation } from "../graphql/generated/graphql";
import { useRouter } from "next/router";
import { mapError } from "../utils/mapError";
import { withUrqlClient } from "next-urql";
import { createClient } from "../utils/createUrqlClient";

interface registerProps {

}

const Register: React.FC<registerProps> = ({ }) => {
    const [_, registerUser] = useRegisterMutation()
    const router = useRouter()
    return (
        <Wrapper>
            <Formik
                initialValues={{ username: '', password: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const result = await registerUser({ options: values })
                    if (result.data?.register.errors) {
                        setErrors(mapError(result.data.register.errors))
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
                            Register
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createClient)(Register)