"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handler_settings_1 = require("../app/handler.settings");
const app_config_1 = require("../app/app.config");
const rest_users_1 = require("./rest.users");
const rest_games_1 = require("./rest.games");
const rest_auth_1 = require("./rest.auth");
class RestAPI_v1 {
    constructor(server, mongoDB, wsServer, passSecurity) {
        this.handlerSettings = null;
        this.url = (mainUrl) => this.handlerSettings.prefix + mainUrl;
        this.handlerSettings = new handler_settings_1.HandlerSettings(mongoDB, wsServer, passSecurity, app_config_1.AppConfig.restAPIPrefix('1'));
        this.users = new rest_users_1.RestUsers(this.handlerSettings);
        this.games = new rest_games_1.RestGames(this.handlerSettings);
        this.auth = new rest_auth_1.RestAuth(this.handlerSettings);
        // Configure all endpoints - may use several Rest.Modules
        // Auth Related:
        server.post(this.url('preregister'), this.auth.preRegisterUser);
        /*
         Follwing methods are only used on MEAN full stack solution:
        */
        /*
                server.post(this.url('authenticate'), this.auth.authenticate);
                server.post(this.url('register'), this.auth.registerUser);
                server.put(this.url('changepassword'), this.handlerSettings.security.authorize, this.auth.changePassword);
                server.post(this.url('uniqueusername'), this.auth.checkUniqueUsername);
                server.post(this.url('uniqueemail'), this.auth.checkUniqueEmail);
        */
        // Users Related:
        server.put(this.url('user/myuser'), this.handlerSettings.security.authorize, this.users.updateMyUser);
        server.get(this.url('users/topten'), this.users.topten);
        //server.del(this.url('destroyusers'), this.users.destroyAllUsers);
        // Lobby related
        server.get(this.url('games/lobby'), this.handlerSettings.security.authorize, this.games.lobby);
        server.get(this.url('games/history/:t'), this.handlerSettings.security.authorize, this.games.history);
        server.post(this.url('games'), this.handlerSettings.security.authorize, this.games.createGame);
        server.post(this.url('games/join'), this.handlerSettings.security.authorize, this.games.joinGame);
        server.post(this.url('games/remove'), this.handlerSettings.security.authorize, this.games.removeGame);
        console.log("RestAPI v1 routes registered");
    }
    ;
}
exports.RestAPI_v1 = RestAPI_v1;
