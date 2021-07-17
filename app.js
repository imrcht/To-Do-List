const express = require("express");
const bodyParser = require("body-parser");
const e = require("express");
const date = require(__dirname+"/date.js");
const app = express();

const items = [];
const workitems = [];

app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
    day = date.getDate();
    res.render("list", {
        listTitle: day,
        newListItems: items,
    });
})

app.post("/", (req, res) =>{
    item = req.body.newItem;
    if (req.body.AddItem === "Work"){
        workitems.push(item);
        res.redirect("/work");
    }
    else {
        items.push(item);
        res.redirect("/");
    }
})

app.get("/work", (req, res) => {
    res.render("list", {
        listTitle: "Work",
        newListItems: workitems,
    })
})

app.post("/clear", (req, res) =>{
    if (req.body.clear === "Work"){
        workitems = [];
        res.redirect("/work");
    }
    else{
        items = []
        res.redirect("/")
    }
})

app.get("/about", (req, res) => {
    res.render("about")
})

app.listen(7000, () => {
    console.log("Listening to port 7000.");
})