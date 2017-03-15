"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RestBase {
    constructor(handlerSettings) {
        this.handleError = (err, response, next) => {
            response.send(500, err);
            next();
        };
        this.handlerSettings = handlerSettings;
        this.mongoDB = this.handlerSettings.mongoDB;
        this.wsServer = this.handlerSettings.wsServer;
    }
}
exports.RestBase = RestBase;
