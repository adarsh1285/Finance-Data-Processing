const mongoose = require('mongoose');
const Role = require('../models/role.model');

mongoose.connect('mongodb+srv://paladarsh9785:KMjZck0YFva2Lrce@cluster0.hoyfgpa.mongodb.net/financeDB?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedRoles = async () => {
  await Role.deleteMany({});

  await Role.insertMany([
    { role_name: 'viewer' },
    { role_name: 'analyst' },
    { role_name: 'admin' },
  ]);

  console.log('Roles inserted');
  process.exit(0);
};

seedRoles().catch(err => {
  console.error(err);
  process.exit(1);
});