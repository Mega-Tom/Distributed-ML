function getData(){
	return [[], []];
}

function postToNetwork(model, url){
	return new Promise((resolve, reject) => {
		let weights = [];
		model.layers.map((layer) =>
			layer.getWeights().map(w => w.arraySync())
		);
		$.ajax({
			type: "POST",
			url: url,
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({weights: weights}),
			success: (data, status)=>{
				resolve({data, status});
			},
			error: (jqXHR, textStatus, errorThrown)=>{
				reject({jqXHR, textStatus, errorThrown});
			}
		});
	});
};

async function run(){
	console.log("running script");

	// Get a model from the server
	const model = await tf.loadLayersModel("/model/model.json");
	model.compile({
		optimizer: 'adam',
		loss: 'categoricalCrossentropy',
		metrics: ['accuracy'],
	});

	// generate a new dataset
	let [inputs, outputs] = getData();

	console.log("Finished data generation, on to training");

	await model.fit(
		tf.tensor(inputs),
		tf.tensor(outputs).reshape([-1,64]),
		{
			epochs: 10,
			batchSize: 60,
			shuffle: true,
			validationSplit: 0.2
		}
	)
	
	await postToNetwork(model, "/model");
	
	console.log("script over");
}