const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, Model, DataTypes } = require('sequelize');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json())
app.use(cors())

// Create Sequelize instance
const sequelize = new Sequelize('boms7mrd9jga5ga8pnvq', 'upfl3ptfdslrwahd', 'xG1niANWs4WBc1fZyR3o', {
  host: 'boms7mrd9jga5ga8pnvq-mysql.services.clever-cloud.com', // Change this to your MySQL host
  dialect: 'mysql',  // Specifies the MySQL dialect
  port: 3306,        // Default MySQL port, change if needed
  logging: false     // Optional: Disable SQL query logging to the console
});


// Define User model
class User extends Model {}
User.init({
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING
}, { sequelize, modelName: 'user' });

class DeviceStatus extends Model {}
DeviceStatus.init({
  status: DataTypes.BOOLEAN,
}, { sequelize, modelName: 'device_status' });

// Sync models with database
sequelize.sync();

// Middleware for parsing request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CRUD routes for User model
app.get('/get-users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

app.get('/dump-user', async (req, res) => {
  await User.create({
    name: "Zain",
    email:"zc@gmail.com",
    password: "zain"
  });

  const users = await User.findAll();
  res.json(users);
});

app.get('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  res.json(user);
});

app.post('/post-users', async (req, res) => {
  console.log(req.body)
  const user = await User.create(req.body);
  res.json(user);
});

app.put('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    await user.update(req.body);
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.delete('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    await user.destroy();
    res.json({ message: 'User deleted' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.put('/devices/:id?', async (req, res) => {
  try {
    const { id } = req.params; // Retrieve device ID from URL, if provided
    let device;

    if (id) {
      // If ID is provided, try to find the device
      device = await DeviceStatus.findByPk(id);
    }

    if (device) {
      // Toggle the 'status' field for an existing device
      const newStatus = !device.status;
      await device.update({ status: newStatus });

      res.json({ 
        message: 'Device status updated successfully', 
        deviceId: device.id, 
        status: device.status 
      });
    } else {
      // Create a new device if not found or no ID provided
      device = await DeviceStatus.create({ 
        id: id || undefined, // Pass ID if provided, else let the database auto-generate it
        status: true // Default status for new devices
      });

      res.status(201).json({ 
        message: 'Device not found, created new device with default status ON', 
        deviceId: device.id, 
        status: device.status 
      });
    }
  } catch (error) {
    // Handle potential errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/devices/:id?', async (req, res) => {
  try {
    const { id } = req.params; // Retrieve device ID from URL, if provided
    
    if(!id) return res.status(400).json({ message: 'Device Id needed' });
    
    const device = await DeviceStatus.findByPk(id);

    return res.status(200).json({ device });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Get Device Status' });
  }
})

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});