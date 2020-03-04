const jwt = require('jsonwebtoken');
const cookieUnique = "unqiuecookie12";

const Auth = function(req, res, next){
    const loginToken = req.cookies.loginToken;
    if (!loginToken){
        res.status(401).send("No Token");
    }
    else{
        jwt.verify(loginToken, cookieUnique, (err, payload) =>{
            if (err){
                res.status(401).send("Invalid");
            }
            else{
            //res.send(payload.email);
            console.log('Verified payload: ' + payload.email);
            next();
            }
        });
    }
}
module.exports = Auth;