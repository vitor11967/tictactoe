"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const auth_util_1 = require("./auth.util");
class PassportSecurity {
    constructor(server, mongo) {
        this.passport = null;
        this.authorize = null;
        this.initMiddleware = (server) => {
            server.use(passport.initialize());
            passport.use(new BearerStrategy((token, done) => {
                let user = auth_util_1.AuthUtil.validateToken(token);
                if (user) {
                    return done(null, user, { scope: 'all' });
                }
                else {
                    return done(null, false);
                }
            }));
        };
        this.passport = passport;
        this.mongo = mongo;
        // Init Middleware
        this.initMiddleware(server);
        this.authorize = this.passport.authenticate('bearer', { session: false });
    }
}
exports.PassportSecurity = PassportSecurity;
