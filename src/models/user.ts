import * as Sequelize from 'sequelize';

export interface UserAttributes {
  google_id: string;
  spotify_access_token?: string;
  spotify_access_token_expiration?: Date;
  spotify_refresh_token?: string;
}

export interface UserInstance extends Sequelize.Instance<UserAttributes> {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  google_id: string;
  spotify_access_token?: string;
  spotify_access_token_expiration?: Date;
  spotify_refresh_token?: string;
}

export function defineUser(sequelize: Sequelize.Sequelize) {
  const user = sequelize.define<UserInstance, UserAttributes>(
      'User', {
        google_id: {type: Sequelize.TEXT, allowNull: false, unique: true},
        spotify_access_token: Sequelize.TEXT,
        spotify_access_token_expiration: Sequelize.DATE,
        spotify_refresh_token: Sequelize.TEXT
      },
      {indexes: [{unique: true, fields: ['google_id']}]});
  return user;
}