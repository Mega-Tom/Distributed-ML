const readline = require('readline-sync');
const tf = require('@tensorflow/tfjs-node');

const EMPTY = 0;
const WHITE = 1;
const BLACK = 2;


function Game(x){
    if(x){
        this.board = x.board.map(row => [...row]);
        this.player = x.player;
    }else{
        this.board = [];
    
        for(var i = 0; i < 8; i++){
            this.board[i] = [];
            for(var j = 0; j < 8; j++){
                this.board[i][j] = 0;
            }
        }
        this.board[4][4] = WHITE;
        this.board[3][3] = WHITE;
        this.board[3][4] = BLACK;
        this.board[4][3] = BLACK;
        this.player = BLACK;
    }
    this.calculateValidMoves();
};

Game.prototype.getSpace = function(a,b){
    var x,y;
    if(b !== undefined){
        x = a;
        y = b;
    }else{
        x = a[0];
        y = b[0];
    }
    if(x < 8 && x >= 0 && y < 8 && y >= 0){
        return this.board[x][y];
    }
    return 0;
};

Game.prototype.getBoardDesc = function(){
    return this.board.map(row =>
        row.map(space => 
            [+(space == 0),
             +(space == this.player),
             +(space == this.player ^ 3)]
             )
        );
}

Game.prototype.drawBoard = function(){
    console.log("");
    var s = "    ";
    for(var j = 0; j < 8; j++){
        s += "_" + j + "_ ";
    }
    console.log(s);
    for(var i = 0; i < 8; i++){
        s = " " + i + " |";
        for(var j = 0; j < 8; j++){
            s += ["___", "(w)", "(B)"][this.board[i][j]];
            s += "|";
        }
        console.log(s);
    }
};

const OFFSETS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
Game.prototype.findCaptures = function(x, y, player){
    if(this.board[x][y] !== EMPTY){
        return [];
    }
    var captures = [];
    for(var i = 0; i < OFFSETS.length; i++){
        var x_ = x + OFFSETS[i][0];
        var y_ = y + OFFSETS[i][1];
        var temp = [];
        while(this.getSpace(x_, y_) === 3 - player){
            temp.push([x_,y_]);
            x_ = x_ + OFFSETS[i][0];
            y_ = y_ + OFFSETS[i][1];
        }
        if(this.getSpace(x_, y_) === player){
            Array.prototype.push.apply(captures, temp);
        }
    }
    return captures;
};

Game.prototype.calculateValidMoves = function() {
    var moves = {};
    for(var i = 0; i < 64; i++){
        var x = Math.floor(i / 8);
        var y = i % 8;
        var c = this.findCaptures(x, y, this.player);
        if(c.length > 0){
            moves[i] = c;
        }
    }
    this.validMoves = moves;
};


Game.prototype.takeMove = function(x, y){
    if(y == null){
        y = (+x) % 8;
        x = Math.floor((+x)/8);
    }
    var captures = this.validMoves[x*8+y];
    if(captures){
        for(var i = 0; i < captures.length; i++){
            this.board[captures[i][0]][captures[i][1]] = this.player;
        }
        this.board[x][y] = this.player;
        this.player ^= 3;
        this.calculateValidMoves(this.player);
    }else{
        //console.log(x+ ", " + y);
        throw new Error(x+ ", " + y + " is not a valid move!");
    }
    if(Object.keys(this.validMoves).length === 0){
        this.player ^= 3;
        this.calculateValidMoves(this.player);
        if(Object.keys(this.validMoves).length === 0){
            this.player = EMPTY;
        }
    }
};

Game.prototype.play = function(ai, disp){
    if(disp) this.drawBoard();
    while(this.player){
        var index = ai[this.player](this.validMoves, this);
        var x = Math.floor((+index)/8);
        var y = (+index) % 8;
        this.takeMove(x, y);
        if(disp) this.drawBoard();
    }
    var counts = [0,0,0];
    for(var i = 0; i < 8; i++){
        for(var j = 0; j < 8; j++){
            counts[this.board[i][j]] ++;
        }
    }
    return counts;
};

Game.prototype.playAndGetData = function(ai){
    const data = {
        boards: [],
        moves: []
    }
    while(this.player){
        var index = ai(this.validMoves, this);
        var x = Math.floor((+index)/8);
        var y = (+index) % 8;

        data.boards.push(this.getBoardDesc());
        const move = 
            Array.from(Array(8), (_, i) => 
                Array.from(Array(8), (_, j) =>
                    [+(i === x && j === y)]));
        data.moves.push(move);

        this.takeMove(x, y);
    }

    return data;
};


var random = function(posibleMoves){
    var best = 0;
    var bestMove;
    for(var index in posibleMoves){
        var value = Math.random();
        if(best < value){
            bestMove = +index;
            best = value;
        }
    }
    return bestMove;
};
var greedy = function(posibleMoves){
    var best = 0;
    var bestMove;
    for(var index in posibleMoves){
        var value = posibleMoves[index].length + Math.random();
        if(best < value){
            bestMove = +index;
            best = value;
        }
    }
    return bestMove;
};
var greedyCorners = function(posibleMoves){
    var best = 0;
    var bestMove;
    for(var index in posibleMoves){
        var value = posibleMoves[index].length + Math.random();
            if(index === "0" || index === "7" ||
               index === "56" || index === "63"){
                value += 10;
            }
        if(best < value){
            bestMove = +index;
            best = value;
        }
    }
    return bestMove;
};
var mcts = (itterations, bot=random) => (function(posibleMoves, game){
    var best = -1;
    var bestMove;
    for(var index in posibleMoves){
        var value = 0; 
        for(let i = 0 ; i < itterations; i++){
            var g = new Game(game);
            g.takeMove(index);
            value += g.play([0,bot,bot])[game.player];
        }
        if(best < value){
            bestMove = +index;
            best = value;
        }
    }
    return bestMove;
});
var human = function(posibleMoves, game){
    var x = +readline.question("row: ");
    var y = +readline.question("col: ");
    return x*8+y;
};
var ann = (net) => (function(posibleMoves, game){
    const values = net.predict(tf.tensor([game.getBoardDesc()])).arraySync()[0];
    var best = 0;
    var bestMove;
    for(var index in posibleMoves){
        var value = values[index];
        if(best < value){
            bestMove = +index;
            best = value;
        }
    }
    return bestMove;
});
var ann_weighted = (net) => (function(posibleMoves, game){
    const results = net.predict(tf.tensor([game.getBoardDesc()])).arraySync()[0];
    var sum = 0;
    for(var index in posibleMoves){
        sum += results[index];
    }
    var rand = Math.random() * sum;
    for(var index in posibleMoves){
        rand -= results[index];
        if(rand < 0)
            return +index;
    }

    return 0;
});
var ann_weighted_cached = (net) => {
    const cache = {};
    return function(posibleMoves, game){
        let results = cache[game.board];
        if(!results)
            results = cache[game.board] = net.predict(tf.tensor([game.getBoardDesc()])).arraySync()[0];
        var sum = 0;
        for(var index in posibleMoves){
            sum += results[index];
        }
        var rand = Math.random() * sum;
        for(var index in posibleMoves){
            rand -= results[index];
            if(rand < 0)
                return +index;
        }

        return 0;
    }
};
var mcts_ann = (itterations, net) => (function(posibleMoves, game){
    var games = [];
    var moves = [];
    for(let index in posibleMoves){
        var g = new Game(game);
        g.takeMove(index);
        for(let i = 0 ; i < itterations; i++){
            games.push(new Game(g));
            moves.push(index);
        }
    }
    let activeGames = games;
    do{
        activeGames = activeGames.filter(g => g.player);
        if(activeGames.length)
            var results = net.predict(tf.tensor(activeGames.map(g => g.getBoardDesc()))).arraySync();
        for(let i = 0; i < activeGames.length; i++){
            const g = activeGames[i];
            var sum = 0;
            for(let index in g.validMoves){
                sum += results[i][index];
            }
            var rand = Math.random() * sum;
            for(let index in g.validMoves){
                rand -= results[i][index];
                if(rand < 0){
                    g.takeMove(+index);
                    break;
                }
            }
        }
    }while(activeGames.length);

    let values = {};
    for(let i = 0; i < games.length; i++){
        values[moves[i]] = values[moves[i]] || 0;
        games[i].board.forEach(row =>
            row.forEach(cell =>
                values[moves[i]] += +(cell = game.player)));
    }
    let bestMove, best = -1;
    for(let index in posibleMoves){
        if(best < values[index]){
            bestMove = +index;
            best = values[index];
        }
    }
    
    return bestMove;
});


exports.Game = Game
exports.ai = {
    random: random,
    greedy: greedy,
    greedyCorners: greedyCorners,
    mcts: mcts,
    human: human,
    ann: ann,
    ann_weighted, ann_weighted,
    ann_weighted_cached: ann_weighted_cached,
    mcts_ann: mcts_ann
}

