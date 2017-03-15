"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rest_base_1 = require("./rest.base");
const auth_util_1 = require("../security/auth.util");
class RestAuth extends rest_base_1.RestBase {
    constructor(handlerSettings) {
        super(handlerSettings);
        this.preRegisterUser = (request, response, next) => {
            if ((request.params.name == null) || (request.params.email == null) ||
                (request.params.username == null)) {
                response.send(400, { 'msg': 'Invalid parameters' } || {});
                return next();
            }
            let name = request.params.name;
            let email = request.params.email;
            let username = request.params.username;
            let newUser = new this.mongoDB.User();
            newUser.username = username;
            newUser.name = name;
            newUser.email = email;
            newUser.totalGames = 0;
            newUser.totalVictories = 0;
            newUser.save().then(function (createdUser) {
                let userInfo = new auth_util_1.UserInfo(createdUser);
                userInfo.userID = createdUser._id;
                //let token = AuthUtil.createNewToken(userInfo);
                //response.send(200, token || {});                       
                response.send(200, userInfo || {});
                next();
            }).catch(function (err) {
                console.error(err);
                next();
            });
        };
    }
}
exports.RestAuth = RestAuth;
