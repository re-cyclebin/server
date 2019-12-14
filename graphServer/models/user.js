const { gql } = require('apollo-server'),
  { userController } = require('../controller'),
  { userSignin, signup, signin } = userController

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

    extend type Query {
      UserSignin (token: String): User
    }

    extend type Mutation {
      signup (username: String, password: String, email: String): User,
      signin (request: String, password: String): PackageSignin,
      reward (getReward: String, id: String): User
    }
  `,
  resolverUser: {
    Query: {
      UserSignin: async (parent, args) => {
        console.log('trigger', args)
        try{ return await userSignin(args.token) }
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
      }
    }
  }
}