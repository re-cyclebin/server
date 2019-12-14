const { gql } = require('apollo-server'),
  { userController } = require('../controller'),
  { userSignin, signup, signin, getPoint, userGetReward, userHistory, allHistoryAdmin, deleteHistoryUser } = userController

module.exports = {
  typeUser: gql`
    type User {
      _id: String,
      username: String,
      email: String,
      password: String,
      point: Int,
      reward: Int,
      role: String
    }

    type PackageSignin {
      user: User
      token: String
    }

    type UserHistory {
      _id: String,
      point: Int,
      UserId: String,
      createdAt: String
    }

    type MsgUser {
      msg: String
    }

    extend type Query {
      UserSignin (token: String): User,
      UserHistory (token: String): [ UserHistory ],

      #admin
      AllHistoryAdmin (token: String): [ UserHistory ]
    }

    extend type Mutation {
      signup (username: String, password: String, email: String): User,
      signin (request: String, password: String): PackageSignin,
      reward (getReward: String, id: String, token: String): User,
      deleteUserHistory (token: String, id: String): MsgUser


      postPoint (point: Int): User
    }
  `,
  resolverUser: {
    Query: {
      UserSignin: async (parent, args) => {
        try{ return await userSignin(args.token) }
        catch(err) { throw new Error(err.response.data.msg) }
      },
      UserHistory: async (parent, args) => {
        try{ return await userHistory(args.token) }
        catch(err) { throw new Error(err.response.data.msg) }
      },

      //admin
      AllHistoryAdmin: async (parent, args) => {
        try{ return await allHistoryAdmin(args.token) }
        catch(err) { throw new Error(err.response.data.msg) }
      }
    },
    Mutation: {
      signup: async (parent, args) => {
        const { username, password, email } = args
        try{ return await signup({ username, password, email }) }
        catch(err) { throw new Error({msg: err.response.data.msg, errors: err.response.data.errors}) }
      },
      signin: async (parent, args) => {
        const { request, password } = args;
        try { return await signin({ request, password }) }
        catch(err) { throw new Error(err.response.data.msg) }
      },
      postPoint: async (parent, args) => {
        const { point, token } = args;
        try{ return await getPoint({ token, point }) }
        catch(err) { throw new Error(err.response.data.msg) }
      },
      reward: async (parent, args) => {
        const { getReward, id, token } = args;
        try { return await userGetReward({ token, getReward, id }) }
        catch(err) { throw new Error(err.response.data.msg) }
      },
      deleteUserHistory: async (parent, args) => {
        const { token, id } = args;
        try { return await deleteHistoryUser({ token, id }) }
        catch(err) { throw new Error(err.response.data.msg) }
      }
    }
  }
}