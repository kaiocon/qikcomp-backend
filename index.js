const express = require("express");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const path = require("path");


const User = require('./Models/User');
const Academy = require('./Models/Academy');
const Event = require('./Models/Event');
const Bracket = require('./Models/Bracket');
const Match = require('./Models/Match');
const Affiliation = require('./Models/Affilliation');
const Auth = require('./Auth');
const cookieUnique = "unqiuecookie12";
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "client", "build")));


app.listen(80, () => {
    console.log("Express started on port 80");
});

mongoose.connect('mongodb://localhost/qikcomp', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Database connection error: '));
db.once('open', () =>{
    console.log('Database Connected!');
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
    User.findOne({email: req.params.email}, async (err, found) =>{
        if(err){
            res.status(500).send();
        }else if(found){
            const id = found.id;
            if(found.academy){
                await Academy.updateOne({_id: found.academy }, { "$pull": { competitors: id }}, (err, success) =>{
                    if(err){console.log(err)}
                    else{console.log(success)}
                });
            }
            found = req.body;
            User.updateOne({email: req.params.email}, found, (err) =>{
                if (err){ res.status(500).send();}
                else{
                    Academy.updateOne({_id: found.academy }, { "$push": { competitors: id }}, (err, success) =>{
                        if(err){console.log(err)}
                        else{console.log(success)}
                    });
                    res.status(200).send(found);
                }
            })
        }

    })

});

app.get("/GETprofile/:id", (req, res) =>{
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
app.get("/GETprofiles", (req, res) =>{
    User.find((err, found) =>{
        if(err){
            res.status(500).send();
        }else if(found){
            let date = new Date();
            let year = date.getFullYear();

            for (let i = 0; i < found.length; i++) {
                let birthYear = found[i].birthDate.getFullYear();
                let age = year - birthYear;
                found[i].password = found[i].email = found[i].phoneNum = found[i].birthDate = undefined;
                found[i].age = age;
            }

            res.send(found);
        }

    })
});

app.post('/createAcademy', Auth, (req, res) => {
    const {address, country, phoneNum, instructor, affiliation, about, profileImage, website} = req.body;
    const name = req.body.name.toUpperCase();
    const manager = jwt.decode(req.cookies.loginToken).email.toLowerCase();
    const competitors = [];
    const academy = new Academy({
        name,
        address,
        country,
        phoneNum,
        instructor,
        affiliation,
        about,
        profileImage,
        website,
        competitors,
        manager
    });
    console.log(academy);
    console.log(name + ' : Attempting to create');
    Academy.findOne({name: name}, async (err, found) => {
        if (found != null) {
            res.status(409).send();
            console.log(name + ' : Academy already exists')
        } else {
            Academy.findOne({manager: manager}, async (err, found2) => {
                if (found2 != null){
                    res.status(409).send();
                    console.log(name + ' : Manager already in use')
                } else{
                    academy.save(async (err, saved) => {
                        if (err) {
                            res.status(500).send();
                            console.log(name + ' : Error Registering!');
                            return console.error(err);
                        } else {
                            let user;
                            user = await User.findOneAndUpdate({email: manager}, {manages: saved._id, academy: saved._id});
                            academy.competitors.push(user._id);
                            academy.save();
                            res.status(200).send(name + ' : Academy Registered!');
                            console.log(name + ' : Academy Registered!');
                        }
                    })
                }})
        }
    });
});

app.get("/GETacademies", (req, res) =>{
    Academy.find().then(found  => {
            if(found){
                res.send(found);
            }
        }


    )});

app.get("/GETacademy/:id", (req, res) =>{
    Academy.findOne({_id: req.params.id}, (err, found) =>{
        if(err){
            res.status(500).send();
        }else if(found){
            res.send(found);
        }

    })
});

app.put("/academy/:id", Auth, (req, res) =>{
    const manager = jwt.decode(req.cookies.loginToken).email.toLowerCase();
    Academy.findOne({_id: req.params.id}, (err, found) =>{
        if(err){
            res.status(500).send();
            console.log(found.name + ' : Academy NAME already in use!!');
        }else if(found.manager === manager){
            const id = found.affiliation;
            console.log(id);
            found = req.body;
            Affiliation.updateOne({_id: id }, { "$pull": { academies: req.params.id }}, (err, success) =>{
                if(err){console.log(err)}
                else{console.log(success)}
            });
            Academy.updateOne({_id: req.params.id}, found, (err) =>{
                if (err){ res.status(500).send();}
                else{
                    res.status(200).send();
                    console.log(found.name + ' : Academy Updated!');
                    Affiliation.updateOne({_id: found.affiliation}, { "$push": { academies: req.params.id }}, (err, success) =>{
                        if(err){console.log(err)}
                        else{console.log(success)}
                    });
                }
            })
        }else{res.status(409).send()
            console.log(found.name + ' : Manager Not Authorised!');}

    })
});



app.post('/createAffiliation', Auth, (req, res) => {
    const {academies, about, profileImage} = req.body;
    const name = req.body.name.toUpperCase();
    const manager = jwt.decode(req.cookies.loginToken).email.toLowerCase();
    const affiliation = new Affiliation({
        name,
        about,
        academies,
        profileImage,
        manager
    });
    console.log(affiliation);
    console.log(name + ' : Attempting to create');
    Affiliation.findOne({name: name}, async (err, found) => {
        if (found != null) {
            res.status(409).send();
            console.log(name + ' : Affiliation already exists')
        } else {
            Affiliation.findOne({manager: manager}, async (err, found2) => {
                if (found2 != null){
                    res.status(409).send();
                    console.log(name + ' : Manager already in use')
                } else{
                    affiliation.save(async (err, saved) => {
                        if (err) {
                            res.status(500).send();
                            console.log(name + ' : Error Registering!');
                            return console.error(err);
                        } else {
                            await User.updateOne({email: manager}, {managesAffiliation: saved._id});
                            res.status(200).send(name + ' : Affiliation Registered!');
                            console.log(name + ' : Affiliation Registered!');
                        }
                    })
                }})
        }
    });
});
app.get("/GETaffiliations", (req, res) =>{
    Affiliation.find().then(found  => {
            if(found){
                res.send(found);
            }
        }


    )});

app.get("/GETaffiliation/:id", (req, res) =>{
    Affiliation.findOne({_id: req.params.id}, (err, found) =>{
        if(err){
            res.status(500).send();
        }else if(found){
            res.send(found);
        }

    })
});
app.put("/affiliation/:id", Auth, (req, res) =>{
    const manager = jwt.decode(req.cookies.loginToken).email.toLowerCase();
    Affiliation.findOne({_id: req.params.id}, (err, found) =>{
        if(err){
            res.status(500).send();
            console.log(found.name + ' : Affiliation NAME already in use!!');
        }else if(found.manager === manager){
            found = req.body;
            Affiliation.updateOne({_id: req.params.id}, found, (err) =>{
                if (err){ res.status(500).send();}
                else{
                    res.status(200).send();
                    console.log(found.name + ' : Affiliation  Updated!');
                }
            })
        }else{res.status(409).send()
            console.log(found.name + ' : Manager Not Authorised!');}

    })
});

app.get("/GETevents", (req, res) =>{
    Event.find().sort({ eventStart: 1 }).then(found  => {
            if(found){
                res.send(found);
            }
        }
    )});

app.get("/GETevent/:id", (req, res) =>{
    Event.findOne({_id: req.params.id}).then(found  => {
            if(found){
                res.send(found);
            }
        }
    )});

app.put("/event/:id", (req, res) =>{
    Event.findOne({_id: req.params.id}).then(found  => {
            if(found){
                found = req.body;
                Event.updateOne({_id: req.params.id}, found, (err) =>{
                    if (err){
                        res.status(500).send('Error Updating Event!');
                        return console.error(err);
                    } else {
                        res.status(200).send('Event Updated!')
                    }
                })

            } else{
                res.status(500).send();
            }
        }
    )});

app.post('/createEvent', Auth, (req, res) => {
    const { address, info, bannerImage, eventStart } = req.body;
    const email = jwt.decode(req.cookies.loginToken).email.toLowerCase();
    const name = req.body.name.toLowerCase();

    const event = new Event({name, email, address, info, bannerImage, eventStart});
    console.log(event);

    Event.findOne({name: name}, async (err, found) =>{
        if (found != null){
            res.status(409).send();
            console.log(name + ' : Event already exists')
        }
        else{
            event.save(async (err, saved)=>{
                if (err){
                    res.status(500).send('Error Registering!');
                    return console.error(err);
                } else {
                    console.log(email, saved._id);
                    await User.updateOne({email: email}, {eventManage: saved._id});
                    res.status(200).send('Event Registered!')
                    console.log(name +' : Event Registered')
                }
            })
        }
    });


});

app.get("/:event/brackets", (req, res) =>{
    Bracket.find({event: req.params.event}).then(found  => {
            if(found){
                res.send(found);
            }
        }
    )});

app.post('/createBracket', Auth, (req, res) => {
    const event = req.body.event;
    const user = jwt.decode(req.cookies.loginToken).email.toLowerCase();
    const bracketName = req.body.bracketName.toLowerCase();

    Event.findOne({_id: event}, async (err, eventFound) => {
        if (eventFound.email != user){
            res.status(500).send();
            console.log(user + ' : Incorrect : ')
        }else{
            console.log('User Authorized')
            const bracket = new Bracket({event, bracketName});
            Bracket.findOne({bracketName: bracketName}, async (err, found) => {
                console.log(found);
                if (found != null) {
                    res.status(409).send();
                    console.log(bracketName + ' : Bracket already exists')
                }
                else{
                    bracket.save((err) => {
                        if (err) {
                            res.status(500).send('Error creating Bracket: ' + bracketName);
                            return console.error(err);
                        }
                        else {
                            res.status(200).send('Bracket Registered!')
                            console.log(bracketName + ' : Event Registered')
                        }
                    })
                }
            });
        }});});

app.put("/bracket/:id", Auth, (req, res) =>{

    const eventManager = jwt.decode(req.cookies.loginToken).email.toLowerCase();
    Event.findOne({email: eventManager}, (err, event)=>{
        Bracket.findOne({_id: req.params.id}, (err, found) =>{
            if(err){
                res.status(500).send();
                console.log(found.name + ' : Bracket update error!');
            }
            else if(event === null){
                res.status(409).send();
                console.log(found.bracketName + ' : ' +  eventManager + ' : Not authorized!');
            }else if(event.email === eventManager){
                found = req.body;
                Bracket.updateOne({_id: req.params.id}, found, (err) =>{
                    if (err){ res.status(500).send();}
                    else{
                        res.status(200).send();
                        console.log(found.bracketName + ' : Bracket  Updated!');
                    }
                })
            }else{res.status(409).send()
                console.log(eventManager + ' : Manager Not Authorised!');}

        })
    })

});

app.get("/match/:id", (req, res) =>{
    Match.findOne({_id: req.params.id}).then(found  => {
            if(found){
                res.send(found);
            }
        }
    )});

app.get("/matchesInBracket/:bracketID", (req, res) =>{
    Match.find({bracketID: req.params.bracketID}).then(found  => {
            if(found){
                res.send(found);
            }
        }
    )});

app.post('/createMatch', Auth, (req, res) => {
    let competitorOne;
    const bracketID = req.body.bracketID;
    const email = req.body.registrant;
    User.findOne({email: email}).then((found, err) =>{
        if (found){
            competitorOne = found.id;
            console.log(competitorOne)
            Match.findOne({competitorTwo: 'OPENSPACE', bracketID: bracketID}).then((found2) =>{
                if(found2 != null && found2.competitorOne != competitorOne){

                    found2.competitorTwo = competitorOne;
                    found2.save((err) =>{
                        if(err){
                            console.log(err);
                            res.status(500).send();
                        }
                        else{res.status(200).send();
                            Bracket.updateOne({_id: bracketID }, { "$push": { competitors: competitorOne}}, (err, success) =>{
                                if(err){console.log(err)}
                                else{console.log(success)}
                            });
                        }
                    })
                } else{
                    Match.findOne({competitorOne: competitorOne, bracketID: bracketID}).then((found3) =>{
                        if(found3 === null){
                            const match = new Match({competitorOne, bracketID});
                            match.save((err) => {
                                if (err) {
                                    res.status(500).send('Error creating match: ' + bracketID);
                                    return console.error(err);
                                }
                                else {
                                    res.status(200).send('Match Registered!')
                                    console.log(bracketID + ' : Match Registered')}
                                Bracket.updateOne({_id: bracketID}, { "$push": { competitors: competitorOne}}, (err, success) =>{
                                    if(err){console.log(err)}
                                    else{console.log(success)}
                                });
                            })
                        }
                        else{res.status(500).send()}
                    })}
            })
        }else{console.log('end')}
    }) ;




});
app.put("/match/:id", (req, res) =>{
    Match.findOne({_id: req.params.id}).then(found  => {
            if(found){
                found = req.body;
                Match.updateOne({_id: req.params.id}, found, (err) =>{
                    if (err){
                        res.status(500).send('Error Updating Match!');
                        return console.error(err);
                    } else {
                        res.status(200).send('Match Updated!')
                    }
                })

            } else{
                res.status(500).send();
            }
        }
    )});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});