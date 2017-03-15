"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HandlerSettings {
    constructor(mongoDB, wsServer, security, prefix) {
        this.mongoDB = null;
        this.wsServer = null;
        this.security = null;
        this.prefix = '';
        this.mongoDB = mongoDB;
        this.wsServer = wsServer;
        this.security = security;
        this.prefix = prefix;
    }
}
exports.HandlerSettings = HandlerSettings;
