function getData({
	games = 5,
	log = false,
	use_symmetry = false,
	bot = mcts(10)
}={}){
	let boards = [];
	let moves = [];
	for(let i = 0; i < games; i++){
		const game = new Game();
		const data = game.playAndGetData(bot);
		boards.push(...data.boards);
		moves.push(...data.moves);
		if(log) console.log(`game ${i+1} ended`);
	}
	if(use_symmetry){
		console.log(`boards.length = ${boards.length}`);
		boards.push(...boards.map(b=>b.slice().reverse()));
		moves.push(...moves.map(b=>b.slice().reverse()));
		boards.push(...boards.map(b=>b.map(r=>r.slice().reverse())));
		moves.push(...moves.map(b=>b.map(r=>r.slice().reverse())));
		console.log(`boards.length = ${boards.length}`);
	}
	return [boards, moves];
}


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
	let [boards, moves] = getData({games: 10, bot: mcts_ann(5, model), use_symmetry: true, log: true});

	console.log("Finished data generation, on to training");

	await model.fit(
		tf.tensor(boards),
		tf.tensor(moves).reshape([-1,64]),
		{
			epochs: 10,
			batchSize: 60,
			shuffle: true,
			validationSplit: 0.2
		}
	)
	for(let i = 0; i < 10; i++){
		let game = new Game();
		console.log(game.play([0, random, ann(model)]));
	}
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
	console.log("script over");
}