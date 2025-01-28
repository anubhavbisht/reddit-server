import React, { useState } from "react";
import { withUrqlClient } from "next-urql";
import { createClient } from "../utils/createUrqlClient";
import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { FormInputField } from "../components/FormInputField";
import { Wrapper } from "../components/Wrapper";
import { mapError } from "../utils/mapError";
import { useForgotPasswordMutation } from "../graphql/generated/graphql";

interface forgotPasswordProps {
}

const ForgotPassword: React.FC<forgotPasswordProps> = ({ }) => {
    const [_, sendResetMail] = useForgotPasswordMutation()
    const [complete, setComplete] = useState(false)
    return (
        <Wrapper>
            <Formik
                initialValues={{ email: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const result = await sendResetMail(values)
                    if (result.data?.forgotPassword.errors) {
                        setErrors(mapError(result.data.forgotPassword.errors))
                    }else{
                        setComplete(true)
                    }
                }}
            >
                {(props) => complete ?<Box>💌If an account with this email exists, a reset link has been sent.🚀</Box> : (
                    <Form>
                        <FormInputField name="email" label="Email" placeholder="Enter your email to receive a reset link." />
                        <Button
                            mt={4}
                            colorScheme='teal'
                            isLoading={props.isSubmitting}
                            type='submit'
                        >
                            Send reset link
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>)
}

export default withUrqlClient(createClient)(ForgotPassword)