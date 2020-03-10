const express = require("express");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');


const User = require('./Models/User');
const Academy = require('./Models/Academy');
const Auth = require('./Auth');
const cookieUnique = "unqiuecookie12";
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.listen(81, () => {
    console.log("Express started on port 81");
});

mongoose.connect('mongodb://localhost/qikcomp', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Database connection error: '));
db.once('open', () =>{
    console.log('Database Connected!');
});

app.get("/", (req, res) =>{
    res.send("QikComp API V0.1");
});

app.post('/registerUser', (req, res) => {
    const { password, firstName, lastName} = req.body;
    const email = req.body.email.toLowerCase();
    console.log(email);
    const user = new User({email, password, firstName, lastName});
    console.log(user.password);
    User.findOne({email: email}, async (err, found) =>{
        if (found != null){
            res.status(409).send();
            console.log(email + ' : Email already exists')
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

    const { password} = req.body;
    const email = req.body.email.toLowerCase();
    console.log(email + ' : Login Attempt');
    const user = new User({email, password});

    User.findOne({email: email}, async (err, found) =>{
        if (found == null){
            res.status(500).send();
            console.log(req.body.email + ': Email not found');
        }
        else if (await bcrypt.compare(password, found.password) === true){
            const options =  {expiresIn:  '1h'};
            const loginToken = jwt.sign({email: email}, cookieUnique, options);
            console.log(found.email + ' : Login Success ');
            res.cookie('loginToken', loginToken, { httpOnly: false }).status(200).send();

        }
        else{
            console.log(found.email + ' : Incorrect password');
            res.status(401).send();
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

            }
        });
    });

app.get("/users", Auth, (req, res) =>{
    User.find().select('-password').then( found  => {
      if(found){
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
            console.log(req.connection.address());
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

app.get("/profile/:id", (req, res) =>{
    User.findOne({_id: req.params.id}, (err, found) =>{
        if(err){
            res.status(500).send();
        }else if(found){
            let date = new Date();
            let year = date.getFullYear();
            let birthYear = found.birthDate.getFullYear();
            let age = year - birthYear;
            found.password = found.email = found.phoneNum = found.birthDate = undefined;
            found.age = age;
            res.send(found);
        }

    })
});

app.post('/createAcademy', Auth, (req, res) => {
    const {address, country, phoneNum, instructor, affiliation, about, profileImage, website} = req.body;
    const name = req.body.name.toUpperCase();
    const academy = new Academy({name, address, country, phoneNum, instructor, affiliation, about, profileImage, website});
    console.log(academy);
    console.log(name + ' : Attempting to create');
    Academy.findOne({name: name}, async (err, found) =>{
        if (found != null){
            res.status(409).send();
            console.log(name + ' : Academy already exists')
        }
        else{
            academy.save((err) =>{
                if (err){
                    res.status(500).send();
                    console.log(name + ' : Error Registering!');
                    return console.error(err);
                } else {
                    res.status(200).send(name + ' : Academy Registered!');
                    console.log(name + ' : Academy Registered!');
                }
            })
        }
    });

    app.get("/academies", (req, res) =>{
        Academy.find().then(found  => {
                if(found){
                    res.send(found);
                }
            }


        )});


});