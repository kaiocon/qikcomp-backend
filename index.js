const express = require("express");

const app = express();

app.listen(80, () => {
    console.log("Express started on port 80");
});

app.get("/", (req, res) =>{
    res.send("Hello!");
});