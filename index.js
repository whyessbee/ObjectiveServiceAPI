import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import bodyparser from 'body-parser'
import ErrorHandle from './middlewares/errorhandler.js';
import objroute from './Route/objectiveroute.js'
import objuserroute from './Route/objectiveuser.js'

dotenv.config({ path: './dev.env' });

const app=express();

try {
    app.use(bodyparser.json());
    app.use("/objective",objroute);
    app.use("/user",objuserroute);

    app.use(ErrorHandle);
    
    mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true })
    mongoose.connection.once('open',()=>console.log('MongoDB Connection Established'))
    .on('error',(err)=>console.error("Error in establishing MongoDB Connection",err));
    
    app.listen(process.env.PORT || 3003, () => {
        console.log("Listening on port " + process.env.PORT);
      });
} catch (error) {
    console.error('Error in initialising the express app');
    throw error;
}

export default app;