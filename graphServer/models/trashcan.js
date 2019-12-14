const { gql } = require('apollo-server'),
  { trashcanController } = require('../controller'),
  { AllTrashCan, createNewTrashCan, updateLocationTrashCan, deleteTrashCan, openTrashCan } = trashcanController


module.exports = {
  typeTrashCan: gql`
    type Map {
      longitude: String,
      latitude: String
    }

    type Trash {
      _id: String,
      location: Map,
      height: Float,
      weight: Float,
      avaible: Boolean,
      status: Boolean
    }

    type MsgTrashCan {
      msg: String
    }

    extend type Query {
      AllTrash (token: String): [ Trash ]
    }

    extend type Mutation {
      makeTrash (token: String, latitude: String, longitude: String ): Trash,
      updateTrashLocation ( id: String, token: String, latitude: String, longitude: String ): Trash,
      deleteTrash (id: String, token: String): MsgTrashCan,

      userOpen (id: String, token: String): Trash
    }
  `,
  resolveTrashCan: {
    Query: {
      AllTrash: async (parent, args) => {
        try{ return await AllTrashCan(args.token) }
        catch(err) { throw new Error(err.response.data.msg) }
      }
    },
    Mutation: {
      makeTrash: async (parent, args) => {
        const { token, longitude, latitude } = args;
        try { return await createNewTrashCan({ longitude, latitude, token }) }
        catch(err) { throw new Error(err.response.data.msg) }
      },
      updateTrashLocation: async (parent, args) => {
        const { token, longitude, latitude } = args;
        try { return await updateLocationTrashCan({ token, latitude, longitude }) }
        catch(err) { throw new Error(err.response.data.msg) }
      },
      deleteTrash: async (parent, args) => {
        const { id, token } = args;
        try { return await deleteTrashCan({ id, token }) }
        catch(err) { throw new Error(err.response.data.msg) }
      },
      userOpen: async (parent, args) => {
        const { id, token } = args;
        try { return await openTrashCan({ id, token }) }
        catch(err) { throw new Error(err.response.data.msg)}
      }
    }
  }
}