export const validateLogin = (usernameOrEmail: string, password: string) => {
    const errors = [];
    if (!usernameOrEmail) {
        errors.push({
            field: 'usernameOrEmail',
            message: 'Username or email is required',
        });
    } else if (usernameOrEmail.includes('@')) {
        if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(usernameOrEmail)) {
            errors.push({
                field: 'usernameOrEmail',
                message: 'Please enter a valid email address',
            });
        }
    } else {
        if (usernameOrEmail.length < 3) {
            errors.push({
                field: 'usernameOrEmail',
                message: 'Username must be at least 3 characters long',
            });
        } else if (!/^[a-zA-Z0-9]+$/.test(usernameOrEmail)) {
            errors.push({
                field: 'usernameOrEmail',
                message: 'Username can only contain letters and numbers',
            });
        }
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
    }
    return errors.length ? errors : null;
};
