const {net} = require('./shared/network.js');
const {Game, ai} = require('./othello.js');
const tf = require('@tensorflow/tfjs-node');


let boards = [];
let moves = [];
for(let i = 0; i < 100; i++){
    const game = new Game();
    const data = game.playAndGetData(ai.mcts(5));
    boards.push(...data.boards);
    moves.push(...data.moves);
    if(i % 10 == 9) console.log(`game ${i+1} ended`);
}
console.log('games ended');


function timeGame(player, name){
    const start = new Date();
    let game = new Game();

    game.play([0,player,player]);

    let res = new Date() - start;

    console.log(`${name} ran a game in ${res}ms or ${Math.round(res/60)}ms/move`);
};


net.fit(
    tf.tensor(boards),
    tf.tensor(moves).reshape([-1,64]),
    {
       epochs: 20,
       batchSize: 60,
       shuffle: true,
       validationSplit: 0.1
    }
)
.then(info => {
    console.log(Math.max(...net.predict(tf.tensor([boards[10]])).arraySync()[0]))
    let ais = {}
/*
    console.log('random vs net'); 
    ais[1] = ai.random;
    ais[2] = ai.ann(net);

    for(let i = 0; i < 10; i++){
        let game = new Game();
        console.log(game.play(ais));
    }

    console.log('mcts 10 vs net');
    ais[1] = ai.mcts(10);
    ais[2] = ai.ann(net);

    for(let i = 0; i < 10; i++){
        let game = new Game();
        console.log(game.play(ais));
    }

    console.log('mcts 50 vs net');
    ais[1] = ai.mcts(50);
    ais[2] = ai.ann(net);

    for(let i = 0; i < 10; i++){
        let game = new Game();
        console.log(game.play(ais));
    }
*/
    timeGame(ai.random, "random");
    timeGame(ai.mcts(10), "MCTS-10");
    timeGame(ai.mcts(100), "MCTS-100");
    timeGame(ai.ann(net), "ANN");
    timeGame(ai.ann_weighted(net), "ann_weighted");

    //timeGame(ai.mcts(4, ai.ann_weighted(net)), "MCTS+ANN");
    //timeGame(ai.mcts(4, ai.ann_weighted_cached(net)), "MCTS+ANN+cache");

    net.save('file://shared/model');
 })
.catch(err =>{
   console.log('An error! ');
   console.error(err)
});

