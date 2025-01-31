export const validateEmail = (email: string) => {
    const errors = [];
    if (!email) {
        errors.push({
            field: 'email',
            message: 'email is required',
        });
    } else {
        if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            errors.push({
                field: 'email',
                message: 'Please enter a valid email address',
            });
        }
    }
    return errors.length ? errors : null;
};
