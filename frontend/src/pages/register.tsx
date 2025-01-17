import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React from "react";
import { Wrapper } from "../components/Wrapper";
import { FormInputField } from "../components/FormInputField";

interface registerProps {

}

const Register: React.FC<registerProps> = ({ }) => {
    return (
        <Wrapper>
            <Formik
                initialValues={{ username: '', password: '' }}
                onSubmit={(values) => {
                    console.log(values, '***************')
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

export default Register