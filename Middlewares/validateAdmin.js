require('dotenv').config();

const jwt = require("jsonwebtoken");

const validateToken = async(req, res, next)=>{
    try{

        const authorizationHeader = req.headers.authorization || req.headers.Authorization;
        
        if(!authorizationHeader || !authorizationHeader.startsWith('Bearer ')){
            return res.status(401).json({msg: "Unauthorized/ Invalid Token"});
        }

        const token = authorizationHeader.split(' ')[1];
            
        const decoded = await jwt.verify(token, process.env.JWTSECRETKEY);

        if(decoded.type !== 'admin'){
            return res.status(401).json({msg: "Invalid Token"});
        }
        req.user = decoded;
        next();
        }
    catch(err){
        return res.status(401).json({msg: "Err in validating token"});
    }
};

module.exports = validateToken;