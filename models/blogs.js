import mongoose from 'mongoose';

const schema=mongoose.Schema;

const blogSchema=new schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    snippet: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
},{timestamps:true});

const Blog=mongoose.model('blog',blogSchema); // blog model

export default Blog;