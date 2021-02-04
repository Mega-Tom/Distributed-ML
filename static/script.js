console.log("running script");


var data = [];
// Define a model for linear regression.
tf.loadLayersModel("/model/model.json").then((model) => {
	console.log(model.predict(tf.tensor(data, [1,8,8,3])).arraySync());
});

for(i = 0; i < 64*3; i++){
	data.push(i%3);
}