import express from 'express';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import graphqlHTTP from 'express-graphql';
import {buildSchema} from 'graphql';
import mongoose from 'mongoose';
import 'dotenv/config';
import Event from './models/events';
import User from './models/users'

//CONNECT TO DB
mongoose.connect(process.env.DB_CONNECTION,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true
    },
    () => {
      console.log('connected to database');
    }
);

const app = express();
const events = [];
app.use(bodyParser.json());
app.use('/api', graphqlHTTP({
  schema: buildSchema(`
    
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }
    
    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }
    
    type User {
      _id: ID!
      email: String!
      password: String
    }
    
    input UserInput {
      email: String!
      password: String!
    }
    
    type RootQuery {
      events: [Event!]!
      users: [User!]!
    }
    
    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }
  
    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    events: async () => {
      try {
        return await Event.find();
      } catch (err) {
        console.log(err);
      }
    },
    users: async () => {
      try {
        return await User.find();
      } catch (error) {
        console.log(error);
      }
    },
    createEvent: async ({eventInput: {title, description, price, date}}) => {
      const event = new Event({
        title: title,
        description: description,
        price: +price,
        date: new Date(date)
      });
      try {
        return await event.save();
      } catch (error) {
        console.log(error);
      }
    },
    createUser: async ({userInput: {email, password}}) => {
      const user = new User({
        email: email,
        password: password,
      });

      try {
        return await user.save();
      } catch (error) {
        console.log(error)
      }
    }
  },
  graphiql: true,
}));

let users = [];

app.get('/users', (req, res) => {
  res.json(users);
});

app.post('/users', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      name: req.body.name,
      password: hashedPassword,
    };

    // users.push(user);
    users = [...users, user];
    res.json({
      'message': `Successfully created user ${user.name}`,
    });
  } catch (e) {
    res.status(500).send();
  }
});

app.post('/users/login', async (req, res) => {
  const user = users.find(user => user.name === req.body.name);

  if (user === undefined) {
    return res.status(401).json({
      'message': 'No user found',
    });
  }

  try {
    const isMatched = await bcrypt.compare(req.body.password, user.password);
    if (!isMatched) {
      return res.status(401).json({
        'message': 'Invalid credentials',
      });
    }

    res.status(200).json({
      'message': 'Successfully logged in',
    });
  } catch (e) {
    res.status(500).send();
  }
});

app.listen(3000);
