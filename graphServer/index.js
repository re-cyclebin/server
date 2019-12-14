const { ApolloServer, gql, makeExecutableSchema } = require('apollo-server'),
  { User, Trash, History } = require('./models'),
  { typeUser, resolverUser } = User,
  { typeTrashCan, resolveTrashCan } = Trash,
  { typeHistory, resolverHistory } = History
  

const typeDefs = gql`
  type Query
  type Mutation
`;


const server = new ApolloServer(
  { 
    schema: makeExecutableSchema({
      typeDefs: [ typeDefs, typeUser, typeTrashCan, typeHistory ],
      resolvers: [ resolverUser, resolveTrashCan, resolverHistory ]
    })
  }
)
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});