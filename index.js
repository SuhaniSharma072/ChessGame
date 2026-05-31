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

updateBoard(board,true);

function updateBoard(board,save){
    let currentBoard=[];
    for(let i=0;i<8;i++){
        currentBoard[i]=[];
    }
    for(let j=0;j<8;j++){
        currentBoard[i][j]=board[i][j];
    }
}

if (save) history.push(currentBoard);

while(chessBoard.hasChildNodes()){
    chessBoard.removeChild(chessBoard.firstChild);
}

for(let i=0;i<8;i++){
    const row=chessBoard.insertRow();
    for(let j=0;j<8;j++){
        const cell=row.insertCell();
        cell.className=(i+j)%2===0? "White" :"Black";
        cell.addEventListener("click",handleClick);
        cell.textContent=history[history.length-1][i][j].unicode;
    }
}

function handleClick(event){
    const row=event.target.parentNode.rowIndex;
    const col=event.target.cellIndex;
    for (let i=0;i<document.getElementsByTagName("td").length;i++){
        document.getElementsByTagName("td")[i].classList.remove("piece-selected");

    }
    if(board[row][col].color===currentPlayer){
        selectedPiece={row,col};
        event.target.classList.add("piece-selected");
    } else{
        if(!selectedPiece) return;
        const targetPiece= {row,col};
        movePiece(selectedPiece,targetPiece);
        selectedPiece=null;
    }
}

function movePiece(selectedPiece,targetPiece){
    const[fromRow,fromCol]=[selectedPiece.row,selectedPiece.col];
    const[toRow,toCol]=[targetPiece.row,selectedPiece.col];
    let move=false;
    if (board[fromRow][fromCol].type==="pawn")move=pawnMove(board,fromRow,fromCol,toRow,toCol,currentPlayer,true,true);
    else if (board[fromRow][fromCol].type==="knight")move=knightMove(board,fromRow,fromCol,toRow,toCol,true);
    else if (board[fromRow][fromCol].type==="bishop")move=bishopMove(board,fromRow,fromCol,toRow,toCol,true);
    else if (board[fromRow][fromCol].type==="rook")move=rookMove(board,fromRow,fromCol,toRow,toCol,true,true);
    else if (board[fromRow][fromCol].type==="queen")move=queenMove(board,fromRow,fromCol,toRow,toCol,true);
    else if (board[fromRow][fromCol].type==="king")move=kingMove(board,fromRow,fromCol,toRow,toCol,true,true);

    if(move){
        board[toRow][toCol]=board[fromRow][fromCol];
        board[fromRow][fromCol]=new Piece("","","");
        pawnToPiece();
        currentPlayer=currentPlayer==="White"?"Black":"White";
        turnIndicator.textContent='Current turn: ${currentPlayer}';
        if(!((toRow==0|| toRow ===7) && board[toRow][toCol].type==="pawn")){updateBoard(board,true);}
        isTheEnd();
    }
}

function pawnMove(thisBoard,fRow,fCol,tRow,tCol,player,enPassant,testCheck){
    const direction =player==="White"? -1:1;
    if((fRow+direction*2===tRow))
}
