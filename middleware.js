const jwt = require("jsonwebtoken");

function authMiddleware(req,res,next){
    const token = req.headers.token;
    if(!token){
        res.status(403).json({
            message: "You are not logged in!"
        })
        return;
    }
    const decoded = jwt.verify(token,"Attlasian123");
    const userId = decoded.userId;
    if(!userId){
        res.status(403).json({
            message: "Malformed token or invalid signature"
        })
        return;
    }
    req.userId = userId;
    next();
}
module.exports = {
    authMiddleware: authMiddleware
}