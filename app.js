const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const e = require("express");
const date = require(__dirname+"/date.js");
const sec = require(__dirname + "/security.js");
const app = express();


app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs");
app.use(express.static("public"));
const conf = sec.getSecurity();

mongoose.connect(`mongodb+srv://${conf.user}:${conf.pwd}@cluster0.vhg7m.mongodb.net/todolistDB`, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const itemsSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name must be there"]
    }
})

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todo list"
})

const item2 = new Item({
    name: "hit the + button to add a new item"
})

const item3 = new Item({
    name: "<---- Hit this to delete an item"
})

let defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
    name: String,
    items: [itemsSchema],
})

const List = mongoose.model("List", listSchema);

let day = date.getDay();

app.get("/", (req, res) => {
    Item.find((err, founditems) => {
        if (err) {
            console.log(err);
        }
        else if (founditems.length == 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfullly inserted default items");
                }
            });
            res.redirect("/");           
        }
        else {
            res.render("list", {
                listTitle: day,
                newListItems: founditems,
            });
        }
    })
    
})

app.post("/", (req, res) =>{
    listname = req.body.listItem;
    itemname = req.body.newItem
    const newitem = new Item({
        name: itemname
    })
    if (listname == day) {
        newitem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listname}, (err, foundlist) => {
            foundlist.items.push(newitem);
            foundlist.save();
            res.redirect("/" + listname);
        })
    }
})

app.post("/delete", (req, res) => {
    const checkItemId = req.body.checkbox;
    const listname = req.body.listname;
    if (listname == day) {
        Item.findByIdAndRemove(checkItemId, (err) =>{
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully deleted");
                res.redirect("/")
            }
        })
    } else {
        List.findOneAndUpdate({name: listname}, {$pull: {items: {_id: checkItemId}}}, (err, list) => {
            if(!err) {
                res.redirect("/" + listname);
            }
        });
    }
})

app.get("/about", (req, res) => {
    res.render("about")
})

app.get("/compose", (req, res) => {
    res.render("compose");
})

app.get("/:customlistname", (req, res) => {
    const customListName = _.capitalize(req.params.customlistname);
    List.findOne({name: customListName}, (err, foundlist) => {
        if (err) {
            console.log(err);
        }
        else if (!foundlist) {
            const list1 = new List({
                name: customListName,
                items: defaultItems
            })
        
            list1.save();
            res.redirect("/"+customListName); 
        }
        else {
                res.render("list", {
                    listTitle: foundlist.name,
                    newListItems: foundlist.items,
                });
            
        }
    })
})

app.post("/compose", (req, res)=> {
    res.redirect("/"+req.body.newList);
})

app.post("/clear", (req, res) =>{
    listtitle = req.body.clear;
    if (listtitle === day){
        Item.deleteMany({}, (err)=> {
            if (err) {
                console.log(err);
            } else {
                console.log("Cleared All!!");
            }
        })
        res.redirect("/")
    }
    else{
        List.findOneAndUpdate({name: listtitle}, {$pull: {items: {}}}, (err, list)=> {
            if(!err) {
                console.log("Cleared all");
                res.redirect("/" + listtitle);
            }
        })
    }
})








app.listen(7000, () => {
    console.log("Listening to port 7000.");
})