import express from 'express';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.json());
const users = [];

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

    users.push(user);
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
