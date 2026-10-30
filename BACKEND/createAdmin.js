const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const dotenv=require("dotenv");

const Admin=require("./model/adminModel");

dotenv.config();

const createAdmin=async()=>{
    try{
        const dbUrl=process.env.DB_URI.replace("<db_password>",process.env.DB_PASS);
        await mongoose.connect(dbUrl);
        console.log("MongoDB connected!!!");

        const existingAdmin=await Admin.findOne({
            email:"admin@nohr.com"
        });

        if(existingAdmin){
            console.log("Admin already exists!");
            process.exit();
        }

        const hashedPassword=await bcrypt.hash("Admin@123",10);

        await Admin.create({
            email:"admin@nohr.com",
            password:hashedPassword
        });

        console.log("Admin created Successfully!");
        process.exit();

    }catch(error){
        console.error("Error creating Admin",error.message);
        process.exit(1);
    }
};

createAdmin();
