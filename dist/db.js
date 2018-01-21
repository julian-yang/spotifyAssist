"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
});
const User = sequelize.define("User", {
    google_id: { type: Sequelize.TEXT, allowNull: false, unique: true },
    spotify_access_token: Sequelize.TEXT,
    spotify_access_token_expiration: Sequelize.DATE,
    spotify_refresh_token: Sequelize.TEXT
});
sequelize.sync();
module.exports.User = User;
module.exports.sequelize = sequelize;
//# sourceMappingURL=db.js.map