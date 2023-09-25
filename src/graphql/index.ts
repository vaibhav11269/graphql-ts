import { ApolloServer } from "@apollo/server";
import { UserGQL } from "./user";

async function createApolloServer() {
    const gqlServer = new ApolloServer({
        typeDefs: `
                ${UserGQL.typeDefs}

                type Query{
                   ${UserGQL.queries}
                }
                type Mutation {
                    ${UserGQL.mutations}
                }
            `,
        resolvers: {
            Query: {
                ...UserGQL.resolvers.queries
            },
            Mutation: {
                ...UserGQL.resolvers.mutations,
            }
        }
    })
    await gqlServer.start();
    return gqlServer;
}
export default createApolloServer;