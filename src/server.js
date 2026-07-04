const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const app = require('./app');

dotenv.config();

const port = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Nexus Social running at http://localhost:${port}`);
  });
});
