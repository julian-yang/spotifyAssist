import * as Sequelize from 'sequelize';

console.log(process.env.DATABASE_URL);
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
});

export const user = sequelize.define(
    'User', {
      google_id: {type: Sequelize.TEXT, allowNull: false, unique: true},
      spotify_access_token: Sequelize.TEXT,
      spotify_access_token_expiration: Sequelize.DATE,
      spotify_refresh_token: Sequelize.TEXT
    },
    {indexes: [{unique: true, fields: ['google_id']}]});
