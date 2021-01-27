const readline = require('readline-sync');

var EMPTY = 0;
var WHITE = 1;
var BLACK = 2;


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
        this.board[4][4] = 1;
        this.board[3][3] = 1;
        this.board[3][4] = 2;
        this.board[4][3] = 2;
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

var OFFSETS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
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
        console.log(x+ ", " + y);
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
var mcts = (itterations) => (function(posibleMoves, game){
    var best = -1;
    var bestMove;
    for(var index in posibleMoves){
        var value = 0; 
        for(let i = 0 ; i < itterations; i++){
            var g = new Game(game);
            g.takeMove(index);
            value += g.play([0,random,random])[game.player];
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



var bots = {
    greedyCorners: greedyCorners,
    mcts_1: mcts(1),
    mcts_5: mcts(5),
    mcts_10: mcts(10), 
    mcts_20: mcts(20),
    mcts_50: mcts(50)
}
var res = {};

for(const i in bots){
    res[i] = {};
    for(var j in bots){
        console.log(i + " vs " + j);
        res[i][j] = 0;
        var ai = {};
        ai[WHITE] = bots[i];
        ai[BLACK] = bots[j];
        for(var n = 0; n < 10; n++){
            var game = new Game();

            var a = game.play(ai);
            if(a[WHITE] > a[BLACK]) res[i][j]++;
            //console.log(a);
        }
    }
}

console.log(JSON.stringify(res));
