import { FormControl, FormLabel, Input, FormErrorMessage, Textarea, InputProps, TextareaProps } from "@chakra-ui/react";
import { useField } from "formik";
import React from "react";

type FormInputFieldProps = {
    label: string;
    name: string;
    isTextArea?: boolean;
    size?: string
} & Omit<InputProps, "size"> & Omit<TextareaProps, "size">;

export const FormInputField: React.FC<FormInputFieldProps> = ({ size, isTextArea = false, label, ...props }) => {
    const [field, { error }] = useField(props.name);

    return (
        <FormControl isInvalid={!!error}>
            <FormLabel fontWeight="bold" color="black" htmlFor={field.name}>{label}</FormLabel>
            {isTextArea ? (
                <Textarea size={size} {...field} {...(props as TextareaProps)} id={field.name} />
            ) : (
                <Input size={size} {...field} {...(props as InputProps)} id={field.name} />
            )}
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
    );
};
