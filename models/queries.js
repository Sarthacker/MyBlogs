import mongoose from 'mongoose';

const schema=mongoose.Schema;

const querySchema=new schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
},{timestamps:true});

const Query=mongoose.model('query',querySchema); // query model

export default Query;