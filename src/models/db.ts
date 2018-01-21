// import * as fs from 'fs';
// import * as path from 'path';
import * as SequelizeStatic from 'sequelize';
import {Sequelize} from 'sequelize';

console.log(`Using DB connection url: ${process.env.DATABASE_URL}`);

// code adapted from
// https://github.com/sequelize/express-example/blob/master/models/index.js and
// https://blog.hobbytrace.com/using-sequelize-with-express-js-in-typescript/
// and https://github.com/suksant/sequelize-typescript-examples/

import * as User from './user';

export interface SequelizeModels {
  User: SequelizeStatic.Model<User.UserInstance, User.UserAttributes>;
}

class Database {
  // private _basename: string;
  private _models: SequelizeModels;
  private _sequelize: Sequelize;

  constructor() {
    // this._basename = path.basename(module.filename);
    this._sequelize = new SequelizeStatic(process.env.DATABASE_URL, {
      dialect: 'postgres',
    });
    this._models = ({} as SequelizeModels);
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
export const models = database.getModels();
// export const User = database.getModels().User;
export const sequelize = database.getSequelize();
