import { RegisterInput } from "../resolvers/user";

export const validateRegister = (options: RegisterInput) => {
    const { username, password, email } = options;
    const errors = [];
    if (!email) {
        errors.push({
            field: 'email',
            message: 'Email is required',
        });
    } else if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        errors.push({
            field: 'email',
            message: 'Please enter a valid email address',
        });
    }
    if (!username) {
        errors.push({
            field: 'username',
            message: 'Username is required',
        });
    } else if (username.length < 3) {
        errors.push({
            field: 'username',
            message: 'Username must be at least 3 characters long',
        });
    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
        errors.push({
            field: 'username',
            message: 'Username can only contain letters and numbers',
        });
    }
    if (!password) {
        errors.push({
            field: 'password',
            message: 'Password is required',
        });
    } else if (password.length < 6) {
        errors.push({
            field: 'password',
            message: 'Password must be at least 6 characters long',
        });
    } else if (!/[A-Z]/.test(password)) {
        errors.push({
            field: 'password',
            message: 'Password must contain at least one uppercase letter',
        });
    } else if (!/[a-z]/.test(password)) {
        errors.push({
            field: 'password',
            message: 'Password must contain at least one lowercase letter',
        });
    } else if (!/\d/.test(password)) {
        errors.push({
            field: 'password',
            message: 'Password must contain at least one number',
        });
    } else if (!/[^a-zA-Z0-9]/.test(password)) {
        errors.push({
            field: 'password',
            message: 'Password must contain at least one special character',
        });
    }
    return errors.length ? errors : null;
};
