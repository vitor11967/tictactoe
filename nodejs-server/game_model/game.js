"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["turnPlayer1"] = 1] = "turnPlayer1";
    GameStatus[GameStatus["turnPlayer2"] = 2] = "turnPlayer2";
    GameStatus[GameStatus["endedTie"] = 10] = "endedTie";
    GameStatus[GameStatus["endedWonPlayer1"] = 11] = "endedWonPlayer1";
    GameStatus[GameStatus["endedWonPlayer2"] = 12] = "endedWonPlayer2";
    GameStatus[GameStatus["canceledByPlayer1"] = 21] = "canceledByPlayer1";
    GameStatus[GameStatus["canceledByPlayer2"] = 22] = "canceledByPlayer2";
    GameStatus[GameStatus["timeout"] = 30] = "timeout";
})(GameStatus = exports.GameStatus || (exports.GameStatus = {}));
// TODO - Change Timeout of the game
exports.TIMEOUT = 20 * 60 * 1000; // Game Timeout in miliSeconds (20 minutos)
class GameEngineError extends Error {
    constructor(m) {
        super(m);
        // Set the prototype explicitly.
        //Object.setPrototypeOf(this, GameEngineError.prototype);
    }
}
class TicTacToeGame {
    constructor(gameId, gameNumber, player1) {
        // 0 - Not played yet
        // 1 - Player 1 
        // 2 - Player 2
        this.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.player1 = '';
        this.player2 = '';
        this.gameStatus = GameStatus.turnPlayer1;
        this.startedDate = null;
        this.player1Name = '';
        this.player2Name = '';
        this.gameId = gameId;
        this.player1 = player1;
        this.player2 = '';
        this.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.gameStatus = GameStatus.turnPlayer1;
        this.gameNumber = gameNumber;
    }
    // Extra Information Related Methods
    end() {
        if (this.startedDate == null) {
            this.startedDate = new Date();
        }
        this.endedDate = new Date();
    }
    touch() {
        this.lastTouchedDate = new Date();
    }
    isGameInactive() {
        if (!this.lastTouchedDate) {
            this.touch();
        }
        return (new Date().getTime() - this.lastTouchedDate.getTime()) > exports.TIMEOUT;
    }
    isBoardComplete() {
        let returnValue = true;
        this.board.forEach(element => {
            if (element == 0) {
                returnValue = false;
                return;
            }
        });
        return returnValue;
    }
    hasRow(value) {
        return ((this.board[0] == value) && (this.board[1] == value) && (this.board[2] == value)) ||
            ((this.board[3] == value) && (this.board[4] == value) && (this.board[5] == value)) ||
            ((this.board[6] == value) && (this.board[7] == value) && (this.board[8] == value)) ||
            ((this.board[0] == value) && (this.board[3] == value) && (this.board[6] == value)) ||
            ((this.board[1] == value) && (this.board[4] == value) && (this.board[7] == value)) ||
            ((this.board[2] == value) && (this.board[5] == value) && (this.board[8] == value)) ||
            ((this.board[0] == value) && (this.board[4] == value) && (this.board[8] == value)) ||
            ((this.board[2] == value) && (this.board[4] == value) && (this.board[6] == value));
    }
    checkGameEnded() {
        if (this.hasRow(1)) {
            this.gameStatus = GameStatus.endedWonPlayer1;
            this.end();
            return true;
        }
        if (this.hasRow(2)) {
            this.gameStatus = GameStatus.endedWonPlayer2;
            this.end();
            return true;
        }
        if (this.isBoardComplete()) {
            this.gameStatus = GameStatus.endedTie;
            this.end();
            return true;
        }
        return false;
    }
    isGameFull() {
        return (this.player1 !== '') && (this.player2 !== '');
    }
    hasGameEnded() {
        return this.gameStatus >= GameStatus.endedTie;
    }
    playerNumberOfUser(userId) {
        if (this.player1 == userId) {
            return 1;
        }
        if (this.player2 == userId) {
            return 2;
        }
        return 0; // userId is not a player
    }
    // Returns false if move was not played
    // Returns true if a move was correctly played
    playMove(userId, position) {
        if (this.hasGameEnded()) {
            return false;
        }
        this.touch();
        if ((position < 0) || (position > 9)) {
            return false;
        }
        let playerNumber = this.playerNumberOfUser(userId);
        if ((playerNumber != 1) && (playerNumber != 2)) {
            return false;
        }
        if ((playerNumber == 1) && (this.gameStatus != GameStatus.turnPlayer1)) {
            return false;
        }
        if ((playerNumber == 2) && (this.gameStatus != GameStatus.turnPlayer2)) {
            return false;
        }
        if (this.board[position] != 0) {
            return false;
        }
        if (this.startedDate == null) {
            this.startedDate = new Date();
        }
        this.board[position] = playerNumber;
        if (!this.checkGameEnded()) {
            if (playerNumber == 1) {
                this.gameStatus = GameStatus.turnPlayer2;
            }
            else {
                this.gameStatus = GameStatus.turnPlayer1;
            }
        }
        return true;
    }
    cancelGame(userId) {
        if (this.hasGameEnded()) {
            return false;
        }
        let playerNumber = this.playerNumberOfUser(userId);
        if ((playerNumber != 1) && (playerNumber != 2)) {
            return false;
        }
        if (playerNumber == 1) {
            this.gameStatus = GameStatus.canceledByPlayer1;
            this.end();
            return true;
        }
        if (playerNumber == 2) {
            this.gameStatus = GameStatus.canceledByPlayer2;
            this.end();
            return true;
        }
    }
    timeoutGame() {
        if (this.hasGameEnded()) {
            return false;
        }
        this.gameStatus = GameStatus.timeout;
        this.end();
        return true;
    }
}
exports.TicTacToeGame = TicTacToeGame;
