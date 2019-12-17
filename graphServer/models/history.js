const { gql } = require('apollo-server'),
  { historyController } = require('../controller'),
  { getAllHistory, makeHistory, deleteSomeHistory } = historyController

module.exports = {
  typeHistory: gql`
    type Puller {
      _id: String,
      username: String,
      email: String
    }
    type TrashId {
      _id: String,
    }
    type History {
      _id: String,
      Puller: Puller,
      TrashId: TrashId,
      weight: Int,
      height: Int,
      createdAt: String,
      updatedAt: String,
    }

    type MsgHistory {
      msg: String
    }

    extend type Query {
      showAllHistory (token: String) : [ History ]
    }
    extend type Mutation {
      createHistory (token: String, id: String): History,
      deleteHistory (token: String, id: String): MsgHistory
    }
  `,
  resolverHistory: {
    Query: {
      showAllHistory: async (parent, args) => {
        try{ return await getAllHistory(args.token) }
        catch(err) { throw new Error(err.response.data.msg) }
      }
    },
    Mutation: {
      createHistory: async (parent, args) => {
        const { token, id } = args;
        try { return await makeHistory({ token, id }) }
        catch(err) { throw new Error({ msg: err.response.data.msg, errors: err.response.data.errors })}
      },
      deleteHistory: async (parent, args) => {
        const { token, id } = args;
        try { return await deleteSomeHistory({ token, id }) }
        catch(err) { throw new Error(err.response.data.msg) }
      }
    }
  }
}