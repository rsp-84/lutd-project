import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';

const app = express();

app.use(cors());

const schema = gql`
    type Query {
        me: User
    }

    type User {
        id: Int,
        username: String,
        email: String

    }
`;
const resolvers = {
    Query: {
        me: () => {
            return {
                id: 23,
                username: 'Ryan',
                email: 'test@test.com'
            };
        },
    },
};

const server = new ApolloServer({
    typeDefs: schema,
    resolvers
});

server.applyMiddleware({ app, path: '/graphql' });

app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql');
});