const jwt=require("jsonwebtoken");

const adminMiddleware=(req,res,next)=>{
    try{
        const token=req.cookies.adminToken;
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Please login as admin to continue!"
            });
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.admin=decoded;

        next();

    }catch(error){
        return res.status(401).json({
            success:false,
            message:"Error in adminMiddleware!"
        });

    }
};

module.exports=adminMiddleware;