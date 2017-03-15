"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppConfig {
}
AppConfig.secret = 'randomstr-efr23fe2r3fegrbnj65645rfghuy4t4gh56r4fw924f9ue1)HG(&F&%"/FT)';
AppConfig.tokenExpirationTime = 240; // in Minutes    
AppConfig.mongoDB = 'mongodb://localhost:27017/tictactoeDB';
AppConfig.restAPIPort = '7777';
AppConfig.restAPIPrefix = (version = '1') => '/v' + version + '/';
AppConfig.restAPIFullPrefix = (version = '1') => ':' + AppConfig.restAPIPort + '/v' + version + '/';
AppConfig.hostname = 'http://localhost';
exports.AppConfig = AppConfig;
