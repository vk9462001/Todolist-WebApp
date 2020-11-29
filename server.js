require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const mongoose = require('mongoose');

const app=express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
const _= require("lodash");

app.set('view engine', 'ejs');



mongoose.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
const ItemSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please check your data entry!"]
	}
});

const Todolist = new mongoose.model("Todolist",ItemSchema);

const Item1 = new Todolist({
	name: "Excercise"
});
const Item2 = new Todolist({
	name: "CollegeWork"
});
const Item3 = new Todolist({
	name: "Training"
});

const defaultItems=[Item1,Item2,Item3];

const listSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please check your data entry!"]
	},
	Items: [ItemSchema]

});

const List = new mongoose.model("List",listSchema);

app.get('/favicon.ico', function(req, res) { 
    res.status(204);
    res.end();    
});

app.get("/",function(req,res){
	
	Todolist.find({},function(err,todolist){
		if(todolist.length===0)
		{
			Todolist.insertMany(defaultItems,function(err){
			  if(err)
  			  {
    			console.log(err);
  			  }
  			  else
  			  {
    			console.log("Successfully saved");
  			  }
			});
			res.redirect("/");
		}
		else
		{
		   res.render('list', {listTitle: "Today",Item: todolist});
		}
	});
});

app.post("/",function(req,res){
	const add=req.body.listitem;
	const listname=req.body.list;

	const Newitem = new Todolist({
		name: add
	});

	if(listname==="Today")
	{
		Newitem.save();
		res.redirect("/");
	}
	else
	{
		List.findOne({name:listname},function(err,foundlist){
			foundlist.Items.push(Newitem);
			foundlist.save();
			res.redirect("/" + listname);
		});
	}
});

app.post("/delete",function(req,res){
	const deleteItem=req.body.checkbox;
	const listname=req.body.listname;

	if(listname==="Today")
	{
		Todolist.findByIdAndRemove(deleteItem,{useFindAndModify: false},function(err){
			if(err)
			{
				console.log(err);
			}
			else
			{
				console.log("Successfully deleted");
				res.redirect("/");
			}
		});
	}
	else
	{
		List.findOneAndUpdate({name: listname}, {$pull: {Items :{_id: deleteItem}}}, {useFindAndModify: false}, function(err,foundlist){
			if(!err)
			{
				res.redirect("/" + listname);
			}
		});
	}
});

app.get("/:topic",function(req,res){
	const Title = _.capitalize(req.params.topic);

	List.findOne({name: Title},function(err,foundlist){
		if(!err)
		{
			if(foundlist)
			{
				//show an existing list
				res.render('list', {listTitle: foundlist.name,Item: foundlist.Items});
			}
			else
			{
				//Create a list
				const list = new List({
					name: Title,
					Items: defaultItems
				});
				list.save();
				res.redirect("/" + Title);
			}
		}
	});
});

app.get("/about",function(req,res){
	res.render('about');
});

app.listen(3000,function(){
	console.log("Server is running on port 3000");
});