import Event from "../../models/events";
import User from "../../models/users";
import bcrypt from "bcrypt";

const eventsCounter = async eventIds => {
  try {
    return await Event.find({
      _id: {
        $in: eventIds
      }
    });
  } catch (error) {
    console.log(error)
  }
};

const userCounter = async userId => {
  const queryUser = await User.findById(userId);
  queryUser.createdEvents = await eventsCounter(queryUser.createdEvents);
  return queryUser;
};

export default {
  events: async () => {
    try {
      const events = await Event.find();
      return await events.map( async event => {
        return {
          ...event._doc,
          date: new Date(event.date).toISOString(),
          creator: await userCounter(event.creator)
        };
      });
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
      date: new Date(date),
      creator: '5e6ccc3f2adcee2f4ff2fc27',
    });
    try {
      const newEvent = await event.save();
      const creator = await User.findById('5e6ccc3f2adcee2f4ff2fc27');
      creator.createdEvents.push(newEvent);
      creator.save();
      return newEvent;
    } catch (error) {
      console.log(error);
    }
},
  createUser: async ({userInput: {email, password}}) => {
    const userExist = User.findOne({email: email});

    if (userExist) {
      throw new Error('User already exist.');
    }

    const user = new User({
      email: email,
      password: await bcrypt.hash(password, 10),
    });

    try {
      return await user.save();
    } catch (error) {
      console.log(error)
    }
  }
}
