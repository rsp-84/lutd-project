import 'dotenv/config';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';

const app = express();

app.use(cors());

// Mock Data for GraphQL START-----
let users = {
    1: {
      id: '1',
      username: 'Ryan',
      messageIds: [1],
    },
    2: {
      id: '2',
      username: 'Evan',
      messageIds: [2],
    },
  };

let messages = {
    1: {
        id: '1',
        text: 'Hello World',
        userId: '1',
    },
    2: {
        id: '2',
        text: 'By World',
        userId: '2',
    },
};

const me = users[1];
// Mock Data for GraphQL END-----

const schema = gql`
    type Query {
        me: User
        user(id: ID!): User
        users: [User!]

        messages: [Message!]!
        message(id: ID!): Message!
    }

    type User {
        id: ID!
        username: String!
        messages: [Message!]
    }

    type Message {
        id: ID!
        text: String!
        user: User!
    }

    type Mutation {
        createMessage(text: String!): Message!
        deleteMessage(id: ID!): Boolean!
        updateMessage(id: ID!, text: String!): Boolean!
    }
`;

const resolvers = {
    Query: {
        user: (parent, { id }) => {
            return users[id];
        },
        me: () => {
            return me;
        },
        users: () => {
            return Object.values(users);
        },
        messages: () => {
            return Object.values(messages);
        },
        message: (parent, { id }) => {
            return messages[id];
        },
    },
    Mutation: {
        createMessage: (parent, { text }, { me }) => {
            const id = uuidv4();
            const message = {
                id,
                text,
                userId: me.id,
            }

            messages[id] = message;
            users[me.id].messageIds.push(id);

            return message;
        },
        updateMessage: (parent, { id }, { text }) => {
            const { [id]: message } = message;

            if (!message) {
                return false;
            }

            messages.text = text;

            return true;
        },
        deleteMessage: (parent, { id }) => {
            const { [id]: message, ...otherMessages } = messages;

            if (!message) {
                return false;
            }

            messages = otherMessages;

            return true;
        },
    },
    Message: {
        user: message => {
            return users[message.userId];
        },
    },  
    User: {
        messages: user => {
            return Object.values(messages).filter(
                message => message.userId === user.id,
            );
        },
    },  
};

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
});

server.applyMiddleware({ app, path: '/graphql' });

app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphql');
});