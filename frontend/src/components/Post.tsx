import { Button, Card, Divider, Heading, VStack } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { useCreatePostMutation, useUpdatePostMutation } from "../graphql/generated/graphql";
import { mapError } from "../utils/mapError";
import { isUserAuthorized } from "../utils/useAuthHook";
import { FormInputField } from "./FormInputField";
import { Layout } from "./Layout";

interface postProps {
    title: string;
    text: string;
    id?: number;
}

export const Post: React.FC<postProps> = ({ title, text, id }) => {
    const router = useRouter();
    isUserAuthorized();
    const [_, createPost] = useCreatePostMutation();
    const [__, updatePost] = useUpdatePostMutation();

    return (
        <Layout variant="regular">
            <Card
                p={10} 
                boxShadow="xl"
                borderRadius="xl"
                bg="white"
                _dark={{ bg: "gray.800" }}
                maxW="600px"
                mx="auto"
                transition="all 0.3s"
                _hover={{ boxShadow: "2xl" }}
            >
                <Heading size="xl" textAlign="center" color="purple.500" mb={6}>
                    {id ? "Edit Your Post" : "Create a New Post"}
                </Heading>
                <Divider mb={8} />
                <Formik
                    initialValues={{ id, title, text }}
                    onSubmit={async (values, { setErrors }) => {
                        if (id) {
                            const { data, error } = await updatePost({ options: values });
                            if (data && !error) {
                                if (data?.updatePost?.errors) {
                                    setErrors(mapError(data.updatePost.errors));
                                } else {
                                    router.push("/");
                                }
                            }
                        } else {
                            const { data, error } = await createPost({ options: values });
                            if (data && !error) {
                                if (data?.createPost.errors) {
                                    setErrors(mapError(data.createPost.errors));
                                } else {
                                    router.push("/");
                                }
                            }
                        }
                    }}
                >
                    {(props) => (
                        <Form>
                            <VStack spacing={6}>
                                <FormInputField
                                    name="title"
                                    label="Title"
                                    placeholder="Enter your post's title"
                                    size="lg"
                                />
                                <FormInputField
                                    isTextArea
                                    name="text"
                                    label="Text"
                                    placeholder="Enter your post's content"
                                    size="lg" 
                                    h="150px" 
                                />
                                <Button
                                    type="submit"
                                    isLoading={props.isSubmitting}
                                    size="lg"
                                    variant="solid"
                                    bgGradient="linear(to-r, purple.500, pink.500)"
                                    color="white"
                                    fontWeight="bold"
                                    borderRadius="full"
                                    px={8} 
                                    py={4} 
                                    _hover={{
                                        bgGradient: "linear(to-r, purple.600, pink.600)",
                                        transform: "scale(1.05)",
                                        boxShadow: "xl",
                                    }}
                                    _active={{
                                        transform: "scale(0.95)",
                                    }}
                                    transition="all 0.2s ease-in-out"
                                    m="auto"
                                    my="8"
                                >
                                    {id ? `Update Post` : `Submit Post`}
                                </Button>
                            </VStack>
                        </Form>
                    )}
                </Formik>
            </Card>
        </Layout>
    );
};
