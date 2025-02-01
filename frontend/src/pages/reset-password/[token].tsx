import { withUrqlClient } from "next-urql";
import { createClient } from "../../utils/createUrqlClient";
import { NextPage } from "next";
import { Box, Button, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { FormInputField } from "../../components/FormInputField";
import { Wrapper } from "../../components/Wrapper";
import { mapError } from "../../utils/mapError";
import { useRouter } from "next/router";
import { useChangePasswordMutation } from "../../graphql/generated/graphql";
import { useState } from "react";
import NextLink from "next/link";

interface resetPasswordProps {
}

const ResetPassword: NextPage<resetPasswordProps> = () => {
    const router = useRouter()
    const [_, change] = useChangePasswordMutation()
    const [tokenError, setTokenError] = useState('')
    return (
        <Wrapper>
            <Formik
                initialValues={{ newPassword: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const token = typeof router.query.token === 'string' ? router.query.token : ""
                    const result = await change({ token, newPassword: values.newPassword })
                    if (result.data?.changePassword.errors) {
                        const errors = mapError(result.data.changePassword.errors)
                        if ('token' in errors) {
                            setTokenError(errors.token)
                        }
                        setErrors(errors)
                    } else {
                        router.push('/')
                    }
                }}
            >
                {(props) => (
                    <Form>
                        <FormInputField name="newPassword" label="New Password" placeholder="Enter your new password" type="password" />
                        {tokenError ?
                            <Box>
                                <Box color='red'>{tokenError}</Box>
                                <NextLink href='/forgot-password'><Link color={'purple'}>Get a reset link again</Link></NextLink>
                            </Box>
                            : null}
                        <Button
                            mt={4}
                            colorScheme='teal'
                            isLoading={props.isSubmitting}
                            type='submit'
                        >
                            Change password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>)
}

export default withUrqlClient(createClient)(ResetPassword)