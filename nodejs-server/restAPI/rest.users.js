"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rest_base_1 = require("./rest.base");
//import {MongoDB} from '../db/mongoDB';
class RestUsers extends rest_base_1.RestBase {
    constructor(handlerSettings) {
        super(handlerSettings);
        this.topten = (request, response, next) => {
            this.mongoDB.User
                .find()
                .sort({ totalVictories: -1 })
                .limit(10)
                .select('username name totalVictories')
                .then(users => {
                response.json(users || []);
                next();
            }).catch(function (err) {
                console.error(err);
            });
        };
        this.updateMyUser = (request, response, next) => {
            if ((request.params.name == null) || (request.params.email == null)) {
                console.error('RestUsers.updateUser: Invalid parameters');
                response.send(400, { 'msg': 'Invalid parameters' } || {});
                return next();
            }
            let name = request.params.name;
            let email = request.params.email;
            let userID = request.user.userID;
            this.handlerSettings.mongoDB.User
                .findById(userID)
                .then(user => {
                if (user === null) {
                    response.send(401, 'Unauthorized');
                    next();
                }
                else {
                    user.name = name;
                    user.email = email;
                    user.save().then(function (updatedUser) {
                        updatedUser.passwordHash = "";
                        response.json({ 'msg': 'User has changed', 'updatedUser': updatedUser } || {});
                        next();
                    }).catch(function (err) {
                        console.error(err);
                        next();
                    });
                }
            }).catch(function (err) {
                console.error(err);
                response.send(401, 'Unauthorized');
                next();
            });
        };
    }
}
exports.RestUsers = RestUsers;
