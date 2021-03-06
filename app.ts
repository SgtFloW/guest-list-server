const express = require('express'),
  path = require('path');

const app = express();
app.use(express.json());

type Guest = {
  id: number;
  firstname: string;
  lastname: string;
  attending: boolean;
};

const guestList: Guest[] = [];
let id = 0;

// Enable CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS',
  );
  next();
});

// Get all guests
app.get('/', function (req, res) {
  res.json(guestList);
});

// New guest
app.post('/', function (req, res) {
  if (!req.body.firstname || !req.body.lastname) {
    res.status(400).json({
      errors: [
        { message: 'Request body missing a firstName or lastName property' },
      ],
    });
    return;
  }

  if (Object.keys(req.body).length > 3) {
    res.status(400).json({
      errors: [
        {
          message:
            'Request body contains more than firstName, lastName and deadline properties',
        },
      ],
    });
    return;
  }

  const guest = {
    id: id++,
    firstname: req.body.firstName,
    lastname: req.body.lastName,
    attending: req.body.attending,
  };

  guestList.push(guest);

  res.json(guestList);
});

// Modify a single guest
app.patch('/:id', function (req, res) {
  const allowedKeys = ['firstName', 'lastName', 'deadline', 'attending'];
  const difference = Object.keys(req.body).filter(
    (key) => !allowedKeys.includes(key),
  );

  if (difference.length > 0) {
    res.status(400).json({
      errors: [
        {
          message: `Request body contains more than allowed properties (${allowedKeys.join(
            ', ',
          )}). The request also contains these extra keys that are not allowed: ${difference.join(
            ', ',
          )}`,
        },
      ],
    });
    return;
  }

  const guest = guestList.find(
    (currentGuest) => currentGuest.id === req.params.id,
  );

  if (!guest) {
    res
      .status(404)
      .json({ errors: [{ message: `Guest ${req.params.id} not found` }] });
    return;
  }

  if (req.body.firstName) guest.firstname = req.body.firstName;
  if (req.body.lastName) guest.lastname = req.body.lastName;
  if ('attending' in req.body) guest.attending = req.body.attending;
  res.json(guest);
});

// Delete a single guest
app.delete('/:id', function (req, res) {
  const guest = guestList.find(
    (currentGuest) => currentGuest.id === req.params.id,
  );

  if (!guest) {
    res
      .status(404)
      .json({ errors: [{ message: `Guest ${req.params.id} not found` }] });
    return;
  }

  guestList.splice(guestList.indexOf(guest), 1);
  res.json(guest);
});

app.listen(process.env.PORT || 5000, () => {
  console.log('???? Guest list server started on http://localhost:5000');
});
