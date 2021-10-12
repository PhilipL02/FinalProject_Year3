const jwt = require("jsonwebtoken");

module.exports = function(req,res,next){
  try{
    let tokenFromUser = req.headers.token;
    let check = jwt.verify(tokenFromUser,process.env['secret']);
    req.userId = check.id;
    next();
  }
  catch(err){
    res.send({message:err.message});
  }
}