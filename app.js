import express from 'express';
import bodyParser from 'body-parser';
import graphqlHTTP from 'express-graphql';
import mongoose from 'mongoose';
import 'dotenv/config';
import graphQLSchema from './graphql/schema/index';
import graphQLResolvers from './graphql/resolvers/index';

const app = express();
app.use(bodyParser.json());

app.use('/api', graphqlHTTP({
  schema: graphQLSchema,
  rootValue: graphQLResolvers,
  graphiql: true,
}));

//CONNECT TO DB
try {
  mongoose.connect(process.env.DB_CONNECTION,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true
    },
    () => {
      app.listen(3000);
      console.log('connected to database');
    }
  );
} catch (error) {
  console.log(error);
}

