var express   = require("express");
var app		  = express();
var bodyParser    = require("body-parser");
var	mongoose      = require("mongoose");
var passport      = require("passport");
var LocalStrategy = require("passport-local");
var	User          = require("./models/user");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine" , "ejs");
app.use(express.static("public"));

var mongoURI = "mongodb+srv://pushvish111:Pushkar@4853@cluster0.pmqiw.mongodb.net/hackshetra?retryWrites=true&w=majority"; 
mongoose.connect(mongoURI, {useUnifiedTopology: true}, function(err){
    if(err){
        console.log(err);
    } else{
        console.log("database connected")
    }
});     

//======================================================authentication===============================================================
app.use(require('express-session')({
	secret: "pv",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/register", function(req, res){
	res.render("register")
})

app.post("/register", function(req, res){
	var newUser = 	new User({username : req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log("error");
			res.render("register"); //render here the register page
		} 
		passport.authenticate("local")(req, res, function(){
			res.render("clinic"); //redirect to the doctors page
		})
	})
})


app.post("/login",passport.authenticate("local" ,
	{
		successRedirect: "/clinic",
		failureRedirect: "/login" 
	}), function(req, res){
	res.render("login");
});

//logout
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/") //redirect to login page
})

//middileware to check logged in       kahin p bhi isse use kr lena jaha bhi usse check krna ho ki wo login h ya nhi
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");  //render login page
}

// =======================================schema mongo ======================================================================
var clinicSchema = new mongoose.Schema({
	clinicName: String,
	city: String,
	address: String,
	contact: Number,
	fees: Number,
	category: String,
	emergencyServ: String, //yes OR no
	appTime: String
});

var clinic = mongoose.model("clinic", clinicSchema);

mongoose.connect("mongodb://localhost/doctor_easy" , {
	useCreateIndex : true,
	useNewUrlParser:true,
	useUnifiedTopology:true,
});

var clinicSampleData = [
		{clinicName: "arpit dental", city: "sirsa",address: "f block",contact: "9383834834",fees: "200",
		 category: "dentist",emergencyServ: "no", appTime: "2pm-4pm"},
		{clinicName: "pushkar ortho", city: "banaras",address: "d block",contact: "9381234834",fees: "500",
		 category: "ortho",emergencyServ: "yes", appTime: "5pm-6pm"}
	]

//====================================================routes==================================================================

app.get("/", function(req, res){
	res.render("landing");
})

app.get("/clinic", function(req, res){
	res.render("clinic");
})

app.post("/clinic-register", function(req, res){
	
	var clinicName = req.body.clinicName;
	var city = req.body.city;
	var fees = req.body.fees;
	var category = req.body.category;
	var appTime = req.body.appTime;
	var emergencyServ = req.body.emergencyServ;
	var contact = req.body.contact;
	
	
	var newClinic = {clinicName: clinicName, city: city, fees: fees, category: category, contact: contact, appTime: appTime, emergencyServ: emergencyServ}
	//create and save to the database
	clinic.create(newClinic, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else{
			//redirect
			res.redirect("/clinic");		
		}
	})
})

app.listen(process.env.PORT || 3000, function(){
     console.log("congo Server has started!!");
});













