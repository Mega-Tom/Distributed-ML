console.log("running script");


// Get a model from the server
tf.loadLayersModel("/model/model.json").then((model) => {
	model.compile({
	    optimizer: 'adam',
	    loss: 'categoricalCrossentropy',
	    metrics: ['accuracy'],
	});
	model.fit(
	    tf.tensor(boards),
	    tf.tensor(moves).reshape([-1,64]),
	    {
	       epochs: 1,
	       batchSize: 60,
	       shuffle: true,
	       validationSplit: 0.1
	    }
	).then(()=>{
		// for(let i = 0; i < 10; i++){
		// 	let game = new Game();
		// 	console.log(game.play([0, random, ann(model)]));
		// }
		let weights = [];
		model.layers.forEach((layer)=>{
			weights.push(layer.getWeights().map(w => w.arraySync()));
		});
		console.log("weights: ");
		console.log(weights);
		$.ajax({
			type: "POST",
			url: "/model",
        	dataType: 'json',
        	contentType: 'application/json',
			data: JSON.stringify({weights: weights}),
			success: (data, status)=>{
				console.log(status);
				console.log(data);
			}
		});
 	})
	
	//console.log(model.predict(tf.tensor(data, [1,8,8,3])).arraySync());
});

let boards = [];
let moves = [];
for(let i = 0; i < 3; i++){
    const game = new Game();
    const data = game.playAndGetData(mcts(1));
    boards.push(...data.boards);
    moves.push(...data.moves);
    if(i % 10 == 9) console.log(`game ${i+1} ended`);
}