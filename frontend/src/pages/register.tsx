import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React from "react";
import { Wrapper } from "../components/Wrapper";
import { FormInputField } from "../components/FormInputField";
import { useMutation } from "urql";

interface registerProps {

}

const registerMutation = `
mutation Register($username: String!, $password: String!) {
  register(options: {username: $username, password: $password}) {
    user {
      id
      createdAt
      updatedAt
      username
    }
    errors {
      field
      message
    }
  }
}
`

const Register: React.FC<registerProps> = ({ }) => {
    const [_, registerUser] = useMutation(registerMutation)
    return (
        <Wrapper>
            <Formik
                initialValues={{ username: '', password: '' }}
                onSubmit={async (values) => {
                    console.log(values, '***************')
                    const result = await registerUser(values)
                    console.log(result)
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