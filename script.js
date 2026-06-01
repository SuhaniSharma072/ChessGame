const chessBoard = document.getElementById("chessBoard");
const turnIndicator = document.createElement("h4");
const modal = document.querySelector('.modal-container');
const modalMessage = document.querySelector('.message');

turnIndicator.textContent = "Current turn: White";
turnIndicator.style.color = 'white';
turnIndicator.style.textAlign = 'center';
document.body.appendChild(turnIndicator);

let currentPlayer = "White";
let history = [];
let selectedPiece = null;
let pendingPromotion = null; 

let wBigCastle = true, wSmallCastle = true, bBigCastle = true, bSmallCastle = true;

class Piece {
    constructor(color, unicode, type) {
        this.color = color;
        this.unicode = unicode;
        this.type = type;
    }
}

let board = Array.from({ length: 8 }, () => Array(8).fill(null));

function empty() {
    return new Piece("", "", "");
}

for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
        if (i === 1) board[i][j] = new Piece("Black", "\u265F", "pawn");
        else if (i === 6) board[i][j] = new Piece("White", "\u2659", "pawn");
        else board[i][j] = empty();
    }
}

const blackBack = [
    ["rook", "\u265C"], ["knight", "\u265E"], ["bishop", "\u265D"],
    ["queen", "\u265B"], ["king", "\u265A"], ["bishop", "\u265D"],
    ["knight", "\u265E"], ["rook", "\u265C"]
];

const whiteBack = [
    ["rook", "\u2656"], ["knight", "\u2658"], ["bishop", "\u2657"],
    ["queen", "\u2655"], ["king", "\u2654"], ["bishop", "\u2657"],
    ["knight", "\u2658"], ["rook", "\u2656"]
];

for (let j = 0; j < 8; j++) {
    board[0][j] = new Piece("Black", blackBack[j][1], blackBack[j][0]);
    board[7][j] = new Piece("White", whiteBack[j][1], whiteBack[j][0]);
}

function copyBoard(b) {
    return b.map(row => row.map(p => new Piece(p.color, p.unicode, p.type)));
}

function saveHistory() {
    history.push({
        board: copyBoard(board),
        currentPlayer,
        wBigCastle, wSmallCastle, bBigCastle, bSmallCastle
    });
}

function updateBoard() {
    while (chessBoard.firstChild) chessBoard.removeChild(chessBoard.firstChild);

    for (let i = 0; i < 8; i++) {
        const row = chessBoard.insertRow();
        for (let j = 0; j < 8; j++) {
            const cell = row.insertCell();
            cell.className = (i + j) % 2 === 0 ? "White" : "Black";
            cell.textContent = board[i][j].unicode;
            cell.onclick = handleClick;

            if (selectedPiece && selectedPiece.r === i && selectedPiece.c === j) {
                cell.classList.add("piece-selected");
            }
        }
    }
}

function handleClick(e) {
    const r = e.target.parentNode.rowIndex;
    const c = e.target.cellIndex;

    if (board[r][c].color === currentPlayer) {
        selectedPiece = { r, c };
        updateBoard();
        return;
    }

    if (!selectedPiece) return;

    if (board[r][c].color === currentPlayer) {
        selectedPiece = null;
        updateBoard();
        return;
    }

    movePiece(selectedPiece, { r, c });
    selectedPiece = null;
}

function movePiece(from, to) {
    const p = board[from.r][from.c];
    if (!p.type) return;

    let valid = false;

    switch (p.type) {
        case "pawn":   valid = pawnMove(from, to, board, currentPlayer); break;
        case "knight": valid = knightMove(from, to); break;
        case "bishop": valid = bishopMove(from, to, board); break;
        case "rook":   valid = rookMove(from, to, board); break;
        case "queen":  valid = queenMove(from, to, board); break;
        case "king":   valid = kingMove(from, to); break;
    }

    if (!valid) return;

    const testBoard = copyBoard(board);
    testBoard[to.r][to.c] = testBoard[from.r][from.c];
    testBoard[from.r][from.c] = empty();

    if (isCheckOnBoard(testBoard, currentPlayer)) return; 
    saveHistory();

    board[to.r][to.c] = p;
    board[from.r][from.c] = empty();

  
    if (p.type === "king") {
        if (currentPlayer === "White") { wBigCastle = false; wSmallCastle = false; }
        else { bBigCastle = false; bSmallCastle = false; }
    }
    if (p.type === "rook") {
        if (from.r === 7 && from.c === 0) wBigCastle = false;
        if (from.r === 7 && from.c === 7) wSmallCastle = false;
        if (from.r === 0 && from.c === 0) bBigCastle = false;
        if (from.r === 0 && from.c === 7) bSmallCastle = false;
    }

    if (p.type === "pawn" && (to.r === 0 || to.r === 7)) {
        pendingPromotion = { r: to.r, c: to.c };
        showModal("Promote your pawn:");
        updateBoard();
        return; 
    }

    currentPlayer = currentPlayer === "White" ? "Black" : "White";
    turnIndicator.textContent = `Current turn: ${currentPlayer}`;

    updateBoard();
    checkGameEnd();
}


function pawnMove(f, t, b, player) {
    const dir = player === "White" ? -1 : 1;
    const target = b[t.r][t.c];

    if (t.c === f.c && !target.type) {
        if (t.r === f.r + dir) return true;
        const startRow = player === "White" ? 6 : 1;
        if (f.r === startRow && t.r === f.r + 2 * dir && !b[f.r + dir][f.c].type) return true;
    }

    if (Math.abs(t.c - f.c) === 1 && t.r === f.r + dir && target.color && target.color !== player)
        return true;

    return false;
}

function knightMove(f, t) {
    return (Math.abs(f.r - t.r) === 2 && Math.abs(f.c - t.c) === 1) ||
           (Math.abs(f.r - t.r) === 1 && Math.abs(f.c - t.c) === 2);
}

// BISHOP
function bishopMove(f, t, b) {
    if (Math.abs(f.r - t.r) !== Math.abs(f.c - t.c)) return false;

    const dr = Math.sign(t.r - f.r);
    const dc = Math.sign(t.c - f.c);
    let r = f.r + dr, c = f.c + dc;

    while (r !== t.r) {
        if (b[r][c].type) return false;
        r += dr; c += dc;
    }
    return true;
}


function rookMove(f, t, b) {
    if (f.r !== t.r && f.c !== t.c) return false;

    if (f.r === t.r) {
        const start = Math.min(f.c, t.c) + 1;
        const end   = Math.max(f.c, t.c);
        for (let i = start; i < end; i++)
            if (b[f.r][i].type) return false;
    } else {
        const start = Math.min(f.r, t.r) + 1;
        const end   = Math.max(f.r, t.r);
        for (let i = start; i < end; i++)
            if (b[i][f.c].type) return false;
    }
    return true;
}


function queenMove(f, t, b) {
    return rookMove(f, t, b) || bishopMove(f, t, b);
}


function kingMove(f, t) {
    return Math.abs(f.r - t.r) <= 1 && Math.abs(f.c - t.c) <= 1;
}


function showModal(msg) {
    modalMessage.textContent = msg;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

function closeModal() {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

function closeBtn() {
    closeModal();
}


function promoteWith(type, unicode) {
    if (!pendingPromotion) return;
    const { r, c } = pendingPromotion;
    const color = board[r][c].color;
    board[r][c] = new Piece(color, unicode, type);
    pendingPromotion = null;
    closeModal();

    currentPlayer = currentPlayer === "White" ? "Black" : "White";
    turnIndicator.textContent = `Current turn: ${currentPlayer}`;
    updateBoard();
    checkGameEnd();
}

function pawnToQueen()  { promoteWith("queen",  currentPlayer === "White" ? "\u2655" : "\u265B"); }
function pawnToRook()   { promoteWith("rook",   currentPlayer === "White" ? "\u2656" : "\u265C"); }
function pawnToBishop() { promoteWith("bishop", currentPlayer === "White" ? "\u2657" : "\u265D"); }
function pawnToKnight() { promoteWith("knight", currentPlayer === "White" ? "\u2658" : "\u265E"); }


function isCheckOnBoard(testBoard, kingColor) {
    let kr, kc;

    for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++)
            if (testBoard[i][j].type === "king" && testBoard[i][j].color === kingColor) {
                kr = i; kc = j;
            }

    if (kr === undefined) return false; 

    const enemy = kingColor === "White" ? "Black" : "White";

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (testBoard[i][j].color !== enemy) continue;

            const f = { r: i, c: j };
            const t = { r: kr, c: kc };
            const p = testBoard[i][j];

            let ok = false;
            if (p.type === "pawn")   ok = pawnMove(f, t, testBoard, enemy);
            if (p.type === "rook")   ok = rookMove(f, t, testBoard);
            if (p.type === "bishop") ok = bishopMove(f, t, testBoard);
            if (p.type === "knight") ok = knightMove(f, t);
            if (p.type === "queen")  ok = queenMove(f, t, testBoard);
            if (p.type === "king")   ok = kingMove(f, t);

            if (ok) return true;
        }
    }

    return false;
}

function checkGameEnd() {
    let hasLegalMove = false;

    outer:
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j].color !== currentPlayer) continue;

            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (board[r][c].color === currentPlayer) continue; 

                    const f = { r: i, c: j };
                    const t = { r, c };
                    const p = board[i][j];
                    let ok = false;

                    if (p.type === "pawn")   ok = pawnMove(f, t, board, currentPlayer);
                    if (p.type === "rook")   ok = rookMove(f, t, board);
                    if (p.type === "bishop") ok = bishopMove(f, t, board);
                    if (p.type === "knight") ok = knightMove(f, t);
                    if (p.type === "queen")  ok = queenMove(f, t, board);
                    if (p.type === "king")   ok = kingMove(f, t);

                    if (ok) {

                        const testBoard = copyBoard(board);
                        testBoard[t.r][t.c] = testBoard[f.r][f.c];
                        testBoard[f.r][f.c] = empty();
                        if (!isCheckOnBoard(testBoard, currentPlayer)) {
                            hasLegalMove = true;
                            break outer;
                        }
                    }
                }
            }
        }
    }

    if (hasLegalMove) return;

    const enemy = currentPlayer === "White" ? "Black" : "White";

    if (isCheckOnBoard(board, currentPlayer)) {
        showModal(enemy + " wins by checkmate! 🎉");
    } else {
        showModal("It's a draw by stalemate.");
    }
}


function undo() {
    if (history.length === 0) return;
    const prev = history.pop();
    board = prev.board;
    currentPlayer = prev.currentPlayer;
    wBigCastle = prev.wBigCastle; wSmallCastle = prev.wSmallCastle;
    bBigCastle = prev.bBigCastle; bSmallCastle = prev.bSmallCastle;
    selectedPiece = null;
    pendingPromotion = null;
    turnIndicator.textContent = `Current turn: ${currentPlayer}`;
    updateBoard();
}


function refresh() {
    location.reload();
}

saveHistory();
updateBoard();