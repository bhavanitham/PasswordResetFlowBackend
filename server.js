const express = require("express");
const bodyParser = require("body-parser");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const connectMongoDB = require("./Configs/ConfigDB");
const UserRoute = require('./Routes/UserRoute');
const cors = require('cors');

//middleware
app.use(cors());
app.use(bodyParser.json());

 
app.use('/api/auth',UserRoute);
app.listen(port, (error) => {
  if (error) {
    console.log(error.message, "Server Failed to Start");
  } else {
    console.log(`Server is running on port ${port}`);
  }
});

connectMongoDB();