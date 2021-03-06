"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("../game_model/game");
const auth_util_1 = require("../security/auth.util");
const io = require('socket.io');
class WebSocketServer {
    constructor() {
        this.contadorSocketMessages = 0;
        this.mongo = null;
        // /////////////////////////////////////////////////////////
        // this.users collection on the server (users connected)
        // Associates UserID with a socket - socket is the Key
        // /////////////////////////////////////////////////////////
        //public users:Map<any,string>;
        // /////////////////////////////////////////////////////////
        // this.games collection on the server (games running)
        // /////////////////////////////////////////////////////////
        this.games = new Map();
        // /////////////////////////////////////////////////////////
        // /////////////////////////////////////////////////////////
        // 
        // WsSocket Communication
        // 
        // /////////////////////////////////////////////////////////
        // /////////////////////////////////////////////////////////
        // /////////////////////////////////////////////////////////
        // SUMMARY
        // /////////////////////////////////////////////////////////
        // MESSAGES RECEIVED FROM CLIENT:
        // /////////////////////////////////////////////////////////
        //
        // identifyMySelf 
        //          client send the token. user related information is kept on the socket
        // myActiveGames 
        //          returns all activeGames from that user
        // enterGame 
        //          user enters the game - creates a game if necessary
        // quitGame 
        //          user quits the game
        // leaveGame 
        //          users leaves the room - does not affect the game, just the socket room
        // play 
        //          user plays a move
        //
        // /////////////////////////////////////////////////////////
        // MESSAGES SENT TO THE  CLIENT - GAME RELATED
        // /////////////////////////////////////////////////////////
        //
        // myListOfGames    (the current user)
        //          send the list of games that a user (current user) is playing
        // refreshGame       (users of a game)
        //          send the game to all users of the room. Passes the game status.
        // gameEnded        (users of a room)
        //          when the game has ended. Passes the game and the reason to the client.
        //          reason can be: ended; timeout; quit 
        // gameInvalidPlay  (users of a room)   
        //          sends a notification for all game users, that someone has played (click) an invalid move
        //          Sends the game status, the player that played the move and the pissition clicked                                'game':game, 
        //         
        // /////////////////////////////////////////////////////////
        // MESSAGES SENT TO THE  CLIENT - GAME RELATED
        // /////////////////////////////////////////////////////////
        //
        // lobby_newGame     (all users)
        //          Someone has created a new game
        //          Sends the gameId that was created, the state of that game and the 
        //          user that created it (player1)  
        // lobby_joinGame    (all users)
        //          Someone has joined a game - it will be the second players
        //          Sends the gameId that was created, the state of that game and the 
        //          player1 and player2.
        //          Note:
        //             player1 -> the user that created the game
        //             player2 -> the user that has joined the game
        // lobby_removeGame    (all users)
        //          Someone has removed a game from the lobby
        //          Sends the gameId that was created, the state of that game and the 
        //          user that deleted it (player1)  
        // /////////////////////////////////////////////////////////
        this.init = (server, mongo) => {
            this.mongo = mongo;
            let wsServer = this;
            //wsServer.users = new Map<any, string>();
            wsServer.games = new Map();
            this.io = io.listen(server);
            this.io.sockets.on('connection', (client) => {
                this.deleteTimeoutGames();
                // ---------------------------------------------------------------------------------
                // identifyMySelf
                // ---------------------------------------------------------------------------------
                // Client passes token on a "identifyMyself" message.
                // userId and UserInfo is kept on the socket
                client.on('identifyMyself', (data) => {
                    let user = auth_util_1.AuthUtil.validateToken(data.token);
                    if (user) {
                        client.userId = user.userID;
                        client.userInfo = user;
                    }
                    else {
                        client.userId = undefined;
                        client.userInfo = undefined;
                    }
                });
                // ---------------------------------------------------------------------------------
                // myActiveGames
                // ---------------------------------------------------------------------------------
                // Returns all games that user is playing
                // Also,
                // If necessary, reenters all games rooms
                client.on('myActiveGames', (data) => {
                    let myGames = this.getGamesOfUser(client.userId);
                    let gamesEntered = [];
                    let myGamesIds = [];
                    for (let key in client.rooms) {
                        if (key != client.id) {
                            gamesEntered.push(String(key));
                        }
                    }
                    myGames.forEach((game) => {
                        game.touch();
                        myGamesIds.push('game_' + game.gameId);
                    });
                    // gamesEntered - roomsID (game_gameID) that user has entered already
                    // myGamesIds - roomsID (game_gameID) that user must enter 
                    myGamesIds.forEach(roomId => {
                        let idx = gamesEntered.indexOf(roomId);
                        if (idx >= 0) {
                            gamesEntered.splice(idx, 1);
                        }
                        else {
                            client.join(roomId);
                        }
                    });
                    // If gamesEntered array has elements, they correspond to rooms that user
                    // has entered but are no longer required
                    gamesEntered.forEach(roomId => {
                        client.leave(roomId);
                    });
                    wsServer.notifySelf(client, 'myListOfGames', myGames);
                });
                // ---------------------------------------------------------------------------------
                // enterGame
                // ---------------------------------------------------------------------------------
                // When someone enters the game, game is loaded from games colection
                // (creates one if required) 
                client.on('enterGame', (data) => {
                    wsServer.getGame(data.gameId, (game) => {
                        game.touch();
                        client.join('game_' + data.gameId);
                    });
                });
                // ---------------------------------------------------------------------------------
                // quitGame
                // ---------------------------------------------------------------------------------
                // When someone quit the game, game is loaded from games colection
                // (creates one if required) and game is cancelead
                // Everybody in that game is notified that game is canceled
                client.on('quitGame', (data) => {
                    if (client.userInfo.username == "123") {
                        throw new Error();
                    }
                    wsServer.getGame(data.gameId, (game) => {
                        game.touch();
                        game.cancelGame(client.userId);
                        wsServer.cleanGame(game.gameId);
                    });
                });
                // ---------------------------------------------------------------------------------
                // leaveGame
                // ---------------------------------------------------------------------------------
                // A message just to leave a game / Room
                // No verification is made if the games exists or if is closed.
                client.on('leaveGame', (data) => {
                    client.leave('game_' + data.gameId);
                });
                // ---------------------------------------------------------------------------------
                // leaveAllGames
                // ---------------------------------------------------------------------------------
                // A message just to leave a game / Room
                // No verification is made if the games exists or if is closed.
                client.on('leaveAllGames', (data) => {
                    let gamesEntered = [];
                    for (let key in client.rooms) {
                        if (key != client.id) {
                            gamesEntered.push(String(key));
                        }
                    }
                    gamesEntered.forEach(roomId => {
                        client.leave(roomId);
                    });
                });
                // ---------------------------------------------------------------------------------
                // play
                // ---------------------------------------------------------------------------------
                client.on('play', (data) => {
                    // Clean inactive games from time to time                
                    wsServer.contadorSocketMessages++;
                    if (wsServer.contadorSocketMessages > 500) {
                        wsServer.contadorSocketMessages = 0;
                        wsServer.deleteTimeoutGames();
                    }
                    wsServer.getGame(data.gameId, (game) => {
                        game.touch();
                        let resultFromPlay = game.playMove(client.userId, data.position);
                        if (resultFromPlay) {
                            wsServer.notifyAllUsersOfGame(data.gameId, 'refreshGame', game);
                            if (game.hasGameEnded()) {
                                wsServer.cleanGame(game.gameId);
                            }
                        }
                        else {
                            wsServer.notifyAllUsersOfGame(data.gameId, 'gameInvalidPlay', {
                                'game': game,
                                'player': game.playerNumberOfUser(client.userId),
                                'position': data.position
                            });
                        }
                    });
                });
            });
            this.io.sockets.on('disconnect', (client) => {
                console.log('Disconnect ' + client.id);
            });
        };
        this.notifyAll = (msgID, msgData) => {
            this.io.sockets.emit(msgID, msgData);
        };
        this.notifyAllOthers = (client, msgID, msgData) => {
            client.broadcast.emit(msgID, msgData);
        };
        this.notifySelf = (client, msgID, msgData) => {
            client.emit(msgID, msgData);
        };
        this.notifyAllUsersOfGame = (gameId, msgID, msgData) => {
            this.io.sockets.in('game_' + gameId).emit(msgID, msgData);
        };
        this.notifyOthersOfGame = (client, gameId, msgID, msgData) => {
            client.broadcast.in('game_' + gameId).emit(msgID, msgData);
        };
    }
    getGame(gameId, nextCallback) {
        let game = this.games.get(gameId);
        if (game) {
            nextCallback(game);
        }
        else {
            this.addGameToWsServer(gameId, nextCallback);
        }
    }
    getGamesOfUser(userId) {
        //this.deleteTimeoutGames();
        let usersGames = [];
        this.games.forEach((game) => {
            if ((game.player1 == userId) || (game.player2 == userId)) {
                usersGames.push(game);
            }
        });
        return usersGames;
    }
    cleanGame(gameId) {
        let gameToClean = this.games.get(gameId);
        if (gameToClean.hasGameEnded()) {
            this.storeGameOnDB(gameToClean, (g) => {
                // Send a notification to refresh the game before sending a notificition that game has ended
                this.notifyAllUsersOfGame(g.gameId, 'refreshGame', g);
                this.notifyAllUsersOfGame(g.gameId, 'gameEnded', g.gameId);
                this.games.delete(gameId);
            });
        }
    }
    deleteTimeoutGames() {
        let gamesToDelete = [];
        this.games.forEach((game, key) => {
            if (game.isGameInactive()) {
                gamesToDelete.push(key);
            }
        });
        gamesToDelete.forEach(key => {
            let game = this.games.get(key);
            game.timeoutGame();
            this.cleanGame(key);
        });
        // Delete games from DB, when timeout time occurred 10 minutes ago  
        let limitDate = new Date().getTime() - game_1.TIMEOUT - 10 * 60 * 1000;
        this.mongo.Game
            .remove({ "createdTime": { $lte: limitDate }, "status": "A" })
            .then(function (d) {
            //
        }).catch(function (err) {
            console.error(err);
        });
    }
    addGameToWsServer(gameId, nextCallback) {
        let wsServer = this;
        //this.deleteTimeoutGames();
        // read game information on the DB
        // Create a Game Instance and put it on the games colection
        // Return created Game
        this.mongo.Game
            .findById(gameId)
            .populate('player1', '_id name')
            .populate('player2', '_id name')
            .then(game => {
            if (game) {
                let tictactoeGame = null;
                tictactoeGame = new game_1.TicTacToeGame(gameId, game.gameId, game.player1._id);
                tictactoeGame.player2 = game.player2._id;
                tictactoeGame.player1Name = game.player1.name;
                tictactoeGame.player2Name = game.player2.name;
                wsServer.games.set(gameId, tictactoeGame);
                game.startedTime = tictactoeGame.startedDate;
                game.save().then(function (updatedGame) {
                    nextCallback(tictactoeGame);
                }).catch(function (err) {
                    console.error(err);
                });
            }
        }).catch(function (err) {
            console.error(err);
        });
    }
    storeGameOnDB(g, nextCallback) {
        let wsServer = this;
        if (!g.hasGameEnded()) {
            nextCallback(g);
            ;
        }
        let mongo = this.mongo;
        mongo.Game
            .findById(g.gameId)
            .then(game => {
            if (game) {
                game.gameState = JSON.stringify(g);
                game.terminatedTime = g.endedDate;
                game.startedTime = g.startedDate;
                game.winner = null;
                game.status = 'T'; //P-Pending; A-Active Gamming; T-Terminated; C-Canceled 
                switch (g.gameStatus) {
                    case game_1.GameStatus.endedWonPlayer1:
                        game.winner = g.player1;
                        break;
                    case game_1.GameStatus.endedWonPlayer2:
                        game.winner = g.player2;
                        break;
                    case game_1.GameStatus.canceledByPlayer1:
                        game.winner = g.player2;
                        break;
                    case game_1.GameStatus.canceledByPlayer2:
                        game.winner = g.player1;
                        break;
                    case game_1.GameStatus.timeout:
                        game.status = 'TIMEOUT';
                        break;
                }
                ;
                game.save().then(function (updatedGame) {
                    mongo.User
                        .findById(updatedGame.player1)
                        .then(user1 => {
                        if (user1) {
                            user1.totalGames = user1.totalGames + 1;
                            if (String(updatedGame.winner) == String(user1._id)) {
                                user1.totalVictories = user1.totalVictories + 1;
                            }
                            user1.save().then(function () {
                                mongo.User
                                    .findById(updatedGame.player2)
                                    .then(user2 => {
                                    if (user2) {
                                        user2.totalGames = user2.totalGames + 1;
                                        if (String(updatedGame.winner) == String(user2._id)) {
                                            user2.totalVictories = user2.totalVictories + 1;
                                        }
                                        user2.save().then(function () {
                                            nextCallback(g);
                                        }).catch(function (err) {
                                            console.error(err);
                                        });
                                    }
                                }).catch(function (err) {
                                    console.error(err);
                                });
                            }).catch(function (err) {
                                console.error(err);
                            });
                        }
                    }).catch(function (err) {
                        console.error(err);
                    });
                }).catch(function (err) {
                    console.error(err);
                });
            }
        }).catch(function (err) {
            console.error(err);
        });
    }
}
exports.WebSocketServer = WebSocketServer;
