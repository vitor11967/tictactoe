const mongoose = require("mongoose");
const autoIncrement = require('mongoose-auto-increment');

import {userSchema, gameSchema} from './db.schema';

export class MongoDB{
    public db : any;
    public User : any;
    public Game : any;

    constructor (uri: string) {
        //this.conn = mongoose.createConnection(uri, { promiseLibrary: require('bluebird') });

        mongoose.Promise = require('bluebird');

        this.db = mongoose.createConnection(uri);
        autoIncrement.initialize(this.db);

        // checkout: https://www.npmjs.com/package/mongoose-auto-increment
        gameSchema.plugin(autoIncrement.plugin, {
            model: 'Game',
            field: 'gameId'
        }); 
        
        this.User = this.db.model('User', userSchema);
        this.Game = this.db.model('Game', gameSchema);

    }
}