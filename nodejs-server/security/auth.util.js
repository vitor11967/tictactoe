"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require('bcrypt');
//const jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');
class UserInfo {
    constructor(userDB) {
        this.username = userDB.username;
        this.name = userDB.name;
        this.email = userDB.email;
    }
}
exports.UserInfo = UserInfo;
class AuthUtil {
    static validatePassword(password, passwordHash) {
        return AuthUtil.checkHash(password, passwordHash);
    }
    // Original - MEAN ONLY:
    /*
    public static createNewToken(userInfo: UserInfo): string {
        // UserInfo is the Token Payload
        var token = jwt.sign(
            userInfo,
            AppConfig.secret,
            {
                issuer: AppConfig.hostname,
                expiresIn: AppConfig.tokenExpirationTime + 'm'
            });
        return token;
    }
    */
    static validateToken(token) {
        // UserInfo is the Token Payload
        try {
            // Original - MEAN ONLY:
            //let decoded = jwt.verify(token, AppConfig.secret);
            //return decoded as UserInfo;
            let dataFromToken = jwtDecode(token).data;
            let userInfo = new UserInfo(dataFromToken);
            userInfo.userID = dataFromToken.userID;
            return userInfo;
        }
        catch (err) {
            return null;
        }
    }
    static generateHash(value) {
        let salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(value, salt);
    }
    static checkHash(value, hash) {
        return bcrypt.compareSync(value, hash);
    }
}
exports.AuthUtil = AuthUtil;
