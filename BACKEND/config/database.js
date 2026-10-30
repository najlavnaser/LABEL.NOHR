const mongoose=require('mongoose');

const database=async()=>{
    try{
        const db_uri=process.env.DB_URI.replace('<db_password>',process.env.DB_PASS);
        await mongoose.connect(db_uri);
        console.log('mongodb connected');
        

    }catch(error){
        console.log(error.message)
    }

}

module.exports=database;