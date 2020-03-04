const express = require("express");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');


const User = require('./Models/User');
const Auth = require('./Auth');
const cookieUnique = "unqiuecookie12";
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.listen(81, () => {
    console.log("Express started on port 81");
});

mongoose.connect('mongodb://localhost/qikcomp', {useNewUrlParser: true, useUnifiedTopology: true, usecreateIndex: true});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Database connection error: '));
db.once('open', () =>{
    console.log('Database Connected!');
});

app.get("/", (req, res) =>{
    res.send("QikComp API V0.1");
});

app.post('/registerUser', (req, res) => {
    const {email, password, firstName, lastName} = req.body;
    const user = new User({email, password, firstName, lastName});
    console.log(user.password);
    User.findOne({email: email}, async (err, found) =>{
        if (found ==! null){
            res.status(409).send();
        }
    else{
            user.save((found)=>{
                if (err){
                    res.status(500).send('Error Registering!');
                    return console.error(err);
                } else {
                    res.status(200).send('User Registered!')
                }
            })
        }
    });


});

app.post('/login', (req, res) =>{

    const {email, password} = req.body;
    console.log(req.body.email);
    const user = new User({email, password});

    User.findOne({email: req.body.email}, async (err, found) =>{
        if (found == null){
            res.status(500).send();
            console.log(found);
        }
        else if (await bcrypt.compare(password, found.password) === true){
            const options =  {expiresIn:  '1h'};
            const loginToken = jwt.sign({email: email}, cookieUnique, options);
            res.cookie('loginToken', loginToken, { httpOnly: false }).status(200).send();

        }
    });

});

app.get("/verifyToken", Auth, (req, res) =>{
    res.status(200).send();
});

app.get("/getUser", Auth, (req, res) =>{
    const loginToken = req.cookies.loginToken;
        jwt.verify(loginToken, cookieUnique, (err, payload) =>{
            if (err){
                res.status(401).send("Invalid");
            }
            else{
                res.send(payload.email);
                console.log('Verified payload: ' + payload.email);

            }
        });
    });

app.get("/users", Auth, (req, res) =>{
    User.find().select('-password').then( found  => {
      if(found){
            found.password = undefined;
            res.send(found);
        }
    }


)});

app.get("/users/:email", Auth, (req, res) =>{
    User.findOne({email: req.params.email}, (err, found) =>{
        if(err){
            res.status(500).send();
        }else if(found){
            found.password = undefined;
            res.send(found);
        }

    })
});
app.put("/users/:email", Auth, async (req, res) =>{
    User.findOne({email: req.params.email}, (err, found) =>{
        if(err){
            res.status(500).send();
        }else if(found){
            found = req.body;
            User.updateOne({email: req.params.email}, found, (err) =>{
                if (err){ res.status(500).send();}
                else{
                    res.status(200).send(found);
                }
            })
        }

    })

    });


