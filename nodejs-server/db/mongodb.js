"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const autoIncrement = require('mongoose-auto-increment');
const db_schema_1 = require("./db.schema");
class MongoDB {
    constructor(uri) {
        //this.conn = mongoose.createConnection(uri, { promiseLibrary: require('bluebird') });
        mongoose.Promise = require('bluebird');
        this.db = mongoose.createConnection(uri);
        autoIncrement.initialize(this.db);
        // checkout: https://www.npmjs.com/package/mongoose-auto-increment
        db_schema_1.gameSchema.plugin(autoIncrement.plugin, {
            model: 'Game',
            field: 'gameId'
        });
        this.User = this.db.model('User', db_schema_1.userSchema);
        this.Game = this.db.model('Game', db_schema_1.gameSchema);
    }
}
exports.MongoDB = MongoDB;
