"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
function defineUser(sequelize) {
    const user = sequelize.define('User', {
        google_id: { type: Sequelize.TEXT, allowNull: false, unique: true },
        spotify_access_token: Sequelize.TEXT,
        spotify_access_token_expiration: Sequelize.DATE,
        spotify_refresh_token: Sequelize.TEXT
    }, { indexes: [{ unique: true, fields: ['google_id'] }] });
    return user;
}
exports.defineUser = defineUser;
//# sourceMappingURL=user.js.map