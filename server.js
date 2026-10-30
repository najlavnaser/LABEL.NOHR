const express=require('express');
const path=require("path");
const cors=require('cors');
const dotenv=require('dotenv');
const cookieParser=require('cookie-parser');

dotenv.config();
const database = require('./config/database');
const app=express();
const userPageRoutes = require("./routes/userPageRoutes");

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ],
    credentials: true,
  })
);



app.use(express.json());
app.use(cookieParser());

app.use("/", userPageRoutes);

app.use(express.static(path.join(__dirname, "../FRONTEND/user")));
app.use('/api/user',require('./routes/userRoutes.js'));
app.use('/api/admin',require("./routes/adminRoutes.js"));





const PORT=process.env.PORT;

app.listen(PORT,async()=>{
    console.log(`Server Running at port ${PORT}!`); 
    await database();
});
