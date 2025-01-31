export const validatePassword = (newPassword: string) => {
    const errors = [];
    if (!newPassword) {
        errors.push({
            field: 'newPassword',
            message: 'New password is required',
        });
    } else if (newPassword.length < 6) {
        errors.push({
            field: 'newPassword',
            message: 'New password must be at least 6 characters long',
        });
    } else if (!/[A-Z]/.test(newPassword)) {
        errors.push({
            field: 'newPassword',
            message: 'New password must contain at least one uppercase letter',
        });
    } else if (!/[a-z]/.test(newPassword)) {
        errors.push({
            field: 'newPassword',
            message: 'New password must contain at least one lowercase letter',
        });
    } else if (!/\d/.test(newPassword)) {
        errors.push({
            field: 'newPassword',
            message: 'New password must contain at least one number',
        });
    } else if (!/[^a-zA-Z0-9]/.test(newPassword)) {
        errors.push({
            field: 'newPassword',
            message: 'New password must contain at least one special character',
        });
    }
    return errors.length ? errors : null;
};