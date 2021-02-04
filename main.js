const express = require("express");

const PORT = process.env.PORT || 7689;

const app = express();

app .use((req, res, next) => {
    	console.log(req.url);
    	next();
    })
    .use(express.static("static"))
	.get("/model", (req, res, next) => {
    	console.log("got the model");
    	next();
    })
    .post("/model", (req, res, next) => {
    	next();
    })
   	//.set('views', 'views')
   	//.set('view engine', 'ejs')
   	.listen(PORT, () => console.log(`Listening on ${ PORT }`));