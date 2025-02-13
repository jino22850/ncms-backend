const express=require('express');

const mongoose =require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');



// Initialize Express app
const app = express()
require("dotenv").config();


const PORT = process.env.PORT || 8070;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
    res.send("Hello World!");
  });
const authRoute = require('./Routes/AuthRoute');
app.use('/slrc/auth', authRoute);
const adminRoutes = require('./Routes/Adminroute');
app.use('/slrc/admin', adminRoutes);
const correspondentRoutes = require('./Routes/Correspondentroute');
app.use('/slrc/cor', correspondentRoutes);
const districtRoutes = require('./Routes/Districtroute');
app.use('/slrc/cor', districtRoutes);
const categoryRoutes = require('./Routes/Categoryroute');
app.use('/slrc/cor', categoryRoutes);
const subcategoryRoutes = require('./Routes/SubCategoryRoute');
app.use('/slrc/cor', subcategoryRoutes);
const eventRoutes = require('./Routes/Eventroute');
app.use('/slrc/cor', eventRoutes);
 const coverageRoutes = require('./Routes/Coverageroute');
 app.use('/slrc/cor', coverageRoutes);
 const paymentRoutes = require('./Routes/PaymentRoute');
 app.use('/slrc/cor', paymentRoutes);


// Connect to MongoDB
const URL = process.env.MONGODB_URL;


mongoose.connect(URL,{
    //useCreateIndex: true,
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
    //useFindAndModify: false
});

const connection = mongoose.connection;
connection.on("error",console.error.bind(console,"MongoDB connection error"))
connection.once('open',()=>{
    console.log("Mongodb connection success");

});

// Start the server
app.listen(PORT , ()=>{
    console.log(`server is up and running on port number: ${PORT}`);
});