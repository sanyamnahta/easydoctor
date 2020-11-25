var express   = require("express");
var app		  = express();
var bodyParser    = require("body-parser");
var	mongoose      = require("mongoose");
var passport      = require("passport");
var LocalStrategy = require("passport-local");
var	User          = require("./model/user");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine" , "ejs");
app.use(express.static("public"));

var mongoURI = "mongodb+srv://mrhashcoder:mansi8101@node.zafk9.mongodb.net/hackathon?retryWrites=true&w=majority"; 
mongoose.connect(mongoURI, {
	useCreateIndex : true,
	useNewUrlParser:true,
	useUnifiedTopology:true,
}, function(err){
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

var patientSchema = new mongoose.Schema({
	name: String,
	city: String,
	address: String,
	contact: Number,
	age: Number,
	gender: String,
});

var patient = mongoose.model("patient", patientSchema);

// var clinicSampleData = [
// 		{clinicName: "arpit dental", city: "sirsa",address: "f block",contact: "9383834834",fees: "200",
// 		 category: "dentist",emergencyServ: "no", appTime: "2pm-4pm"},
// 		{clinicName: "pushkar ortho", city: "banaras",address: "d block",contact: "9381234834",fees: "500",
// 		 category: "ortho",emergencyServ: "yes", appTime: "5pm-6pm"}
// 	]

//====================================================routes==================================================================

app.get("/", function(req, res){
	res.render("landing");
})

app.get("/clinic", function(req, res){
	res.render("clinic");
})

app.get("/cliniclogin", function(req, res){
	res.render("cliniclogin");
})

app.get("/clinicregister", function(req, res){
	res.render("clinicregister");
})

// app.get("/patient", function(req, res){
// 	res.render("patient");
// })

app.get("/patient", async function(req, res){
	clinic.find({}, function(err, allClinic){
		if(err){
			console.log(err);
		} else{
			res.render("patient",{clinic: allClinic});		
		}
	})
})

app.get("/patientregister", function(req, res){
	res.render("patientregister");
})

app.get("/patientlogin", function(req, res){
	res.render("patientlogin");
})

app.post("/clinicregister", function(req, res){
	
	var clinicName = req.body.clinicName;
	var city = req.body.city;
	var fees = req.body.fees;
	var category = req.body.category;
	var appTime = req.body.appTime;
	var emergencyServ = req.body.emergencyServ;
	var contact = req.body.contact;
	var address = req.body.address;
	
	var newClinic = {clinicName: clinicName, city: city, fees: fees, category: category, contact: contact, appTime: appTime, emergencyServ: emergencyServ, address: address}
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

app.post("/patientregister", function(req, res){
	
	var name = req.body.name;
	var city = req.body.city;
	var age = req.body.age;
	var address = req.body.address;
	var gender = req.body.gender;
	var contact = req.body.contact;

	
	var newPatient = {name: name, city: city, age: age, address: address, contact: contact, gender: gender}
	//create and save to the database
	patient.create(newPatient, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else{
			//redirect
			res.redirect("/patient");		
		}
	})
})


app.listen(process.env.PORT || 3000, function(){
     console.log("congo Server has started!!");
});