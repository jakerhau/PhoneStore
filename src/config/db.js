const moongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();


moongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000
})
.then(() => {
    console.log('Database connected', moongoose.connection.name);
})
.catch((err) => {
    console.log(err);
})


