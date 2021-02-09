const express = require("express");
const {update} = require("./shared/network");
bodyParser = require('body-parser');

const PORT = process.env.PORT || 7689;

const app = express();

app .use((req, res, next) => {
    	console.log(`${req.method}: ${req.url}`);
    	next();
    })
	.use(bodyParser.json({limit: "1mb"}))
	.get("/model", (req, res, next) => {
    	console.log("GET request for the model");
    	next();
    })
    .post("/model", (req, res, next) => {
    	console.log("POST request for the model*");
    	console.log(req.body);

    	update("shared/model", req.body.weights).then(()=>{
    		res.status(200).send("OK");
    	}).catch((err)=>{
    		console.log(err);
    		res.status(500).send("OH NO!");
    	})
    })
    .use(express.static("static"))
    .use(express.static("shared"))
   	//.set('views', 'views')
   	//.set('view engine', 'ejs')
   	.listen(PORT, () => console.log(`Listening on ${ PORT }`));