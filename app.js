import express from 'express';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import {promises as fs} from 'fs';
import morgan from 'morgan';
import mongoose from 'mongoose';
import Blog from './models/blogs.js';
import Query from './models/queries.js';
import dotenv from 'dotenv';
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app=express();
app.use(morgan('dev'));


// connect to MongoDB
const blogs_db=process.env.blogs_db;
mongoose.connect(blogs_db) // async method
    .then((response)=> {
        // listen for requests
        let port=process.env.port;
        app.listen(port);
        console.log(`Server running at http://127.0.0.1:${port}`)
        console.log(`Connected to db: ${response}`)
    })
    .catch((error)=> console.error(`Can't connect to the db: ${error}`));

app.set('view engine','ejs');


// Middleware to block prefetch requests
app.use((req, res, next) => {
    if (req.headers.purpose === 'prefetch') {
        console.log('Prefetch request blocked:', req.url);
        return res.status(204).end(); // No content
    }
    next();
});
// Middleware to disable caching for development
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});
app.use(express.urlencoded({ extended: true })); // For form data
app.use(express.json()); // For JSON data

// serve public folder
app.use(express.static(path.join(__dirname, 'public')));


// Submitting the form and accessing the data
app.post('/submit-contact',async (request,response)=>{
    const query=new Query(request.body);
    console.log(query);
    const result = await query.save();
    console.log("Query Submitted:", result);
    response.render('form-submitted', {title: 'Thank You'});
});


// Routes
app.get('/',async (request,response)=>{
    try{
        const blogs=await Blog.find().sort({createdAt:-1}); // latest blogs
        console.log(blogs);
        response.render('index',{title:'Home',blogs});
    }
    catch(error){
        console.error(`Request Failed: ${error}`);
    }
});

app.get('/about',(request,response)=>{
    response.render('about',{title:'About Me'});
});

app.get('/contact',(request,response)=>{
    response.render('contact',{title:'Contact Me'})
});

app.get('/blogs/create',(request,response)=>{
   response.render('create',{title:'Create Blogs'});
});

app.post('/submit-blog', async (request,response)=>{
    const blog=new Blog(request.body);
    console.log(blog);
    const result = await blog.save();
    console.log("Blog saved:", result);
    response.render('blog-submitted', {title: 'Thank You'});
});

// Full content of each blog
app.get('/blog/:id', async (request,response)=>{
    try{
        const blogs=await Blog.find();
        const blog = blogs.find(item => item.id == request.params.id);
        response.render('blogs',{title:blog.title,blog});
    }
    catch(error){
        response.render('no-blog',{title:"Error 500"});
    }
});

// 404 page
app.use((request,response)=>{
    response.status(404).render('404',{title:'Page Not Found'});
});