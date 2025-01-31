import { PostInput } from "../post";

export const validatePost = (options: PostInput) => {
    const { text, title } = options;
    const errors = [];
    if (!title) {
        errors.push({
            field: 'title',
            message: "Post's Title is required",
        });
    }
    else if (title.length < 7) {
        errors.push({
            field: 'title',
            message: 'Title must be at least 10 characters long',
        });
    }
    if (!text) {
        errors.push({
            field: 'text',
            message: "Post's content can't be empty"
        });
    } else if (text.length < 20) {
        errors.push({
            field: 'text',
            message: 'Post content should be 20 characters long',
        });
    }
    return errors.length ? errors : null;
};