const chessBoard=document.getElementById("chessBoard");
const turnIndicator=document.createElement("h4");

const modal=document.querySelector(.modal-container);

turnIndicator.textContent="Current turn:white";
turnIndicator.style.color='white';
turnIndicator.style.textAlign='center';
document.body.appendChild(turnIndicator);
let currentPlayer="White";
let history=[];
let selectedPiece=null;
let wBigCastle=true, wSmallCastle=true,bBigCastle=true,bSmallCastle=true;
let wBigCastleAt=null, bBigCastleAt=null,wSmallCastleAt=null,bSmallCastleAt=null;

class Piece{
    constructor(color, unicode,type){
        this.color=color;
        this.unicode=unicode;
        this.type=type;
    }
}

let board = [];
for (let i = 0; i < 8; i++) {
    board[i] = [];
    for (let j = 0; j < 8; j++) {
        if (i === 1) board[i][j] = new Piece("Black", "\u265F", "pawn"); 
        else if (i === 6) board[i][j] = new Piece("White", "\u2659", "pawn"); 
        else if (i < 2) {
            if (j === 0 || j === 7) board[i][j] = new Piece("Black", "\u265C", "rook"); 
          
          else if (j === 1 || j === 6) board[i][j] = new Piece("Black", "\u265E", "knight"); 
            else if (j === 2 || j === 5) board[i][j] = new Piece("Black", "\u265D", "bishop"); 
            else if (j === 3) board[i][j] = new Piece("Black", "\u265B", "queen"); 
            else if (j === 4) board[i][j] = new Piece("Black", "\u265A", "king"); 
        } 


        else if (i > 5) {
            if (j === 0 || j === 7) board[i][j] = new Piece("White", "\u2656", "rook");
            else if (j === 1 || j === 6) board[i][j] = new Piece("White", "\u2658", "knight"); 
            else if (j === 2 || j === 5) board[i][j] = new Piece("White", "\u2657", "bishop"); 
            else if (j === 3) board[i][j] = new Piece("White", "\u2655", "queen"); 
            else if (j === 4) board[i][j] = new Piece("White", "\u2654", "king"); 
        } 
        else board[i][j] = new Piece("", "  ", "");
    }
}


