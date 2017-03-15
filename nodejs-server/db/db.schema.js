"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
exports.userSchema = mongoose.Schema({
    username: String,
    name: String,
    email: String,
    totalGames: Number,
    totalVictories: Number
});
/*
 Follwing schema only used on MEAN full stack solution:
*/
/*
export let userSchema = mongoose.Schema({
    username: String,
    passwordHash: String,
    name: String,
    email: String,
    totalGames: Number,
    totalVictories: Number
});
*/
exports.gameSchema = mongoose.Schema({
    gameId: { type: Number, default: 0 },
    status: String,
    player1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdTime: Date,
    startedTime: Date,
    terminatedTime: Date,
    gameState: String // The complete game state in JSON    
});
