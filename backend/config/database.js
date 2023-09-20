const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const connectDb = () => {
  mongoose
    .connect(
      process.env.NODE_ENV == 'DEVELOPMENT'
        ? process.env.DB_LOCAL_URI
        : process.env.DB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then((con) => {
      console.log(
        `MongoDB Database connected with HOST: ${con.connection.host}`
      );
    });
};

module.exports = connectDb;
