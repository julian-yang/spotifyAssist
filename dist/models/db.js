"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as fs from 'fs';
// import * as path from 'path';
const SequelizeStatic = require("sequelize");
console.log(`Using DB connection url: ${process.env.DATABASE_URL}`);
// code adapted from
// https://github.com/sequelize/express-example/blob/master/models/index.js and
// https://blog.hobbytrace.com/using-sequelize-with-express-js-in-typescript/
// and https://github.com/suksant/sequelize-typescript-examples/
const User = require("./user");
class Database {
    constructor() {
        // this._basename = path.basename(module.filename);
        this._sequelize = new SequelizeStatic(process.env.DATABASE_URL, {
            dialect: 'postgres',
        });
        this._models = {};
        this._models.User = User.defineUser(this._sequelize);
    }
    getModels() {
        return this._models;
    }
    getSequelize() {
        return this._sequelize;
    }
}
const database = new Database();
exports.models = database.getModels();
// export const User = database.getModels().User;
exports.sequelize = database.getSequelize();
//# sourceMappingURL=db.js.map