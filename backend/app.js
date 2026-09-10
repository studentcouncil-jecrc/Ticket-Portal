import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import { connectToDB } from './db/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
const app = express();
import adminRoutes from './routes/admin.routes.js'


connectToDB();




app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use(cors());


app.use("/admin", adminRoutes);




app.get("/", (req, res) => {
    res.status(200).json({ success: true, msg: "Server is running" }); 
});

export default app;
