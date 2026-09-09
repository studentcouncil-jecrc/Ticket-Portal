const mongoose = require("mongoose")


const connectToDB =  async() => {

    await mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.log(`${process.env.MONGO_URI} MongoDB connection failed: ${err}`);
    })
}

module.exports = connectToDB