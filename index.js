import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import bodyparser from 'body-parser'
import ErrorHandle from './middlewares/errorhandler.js';
import objroute from './Route/objectiveroute.js'
import objuserroute from './Route/objectiveuser.js'
import logger from './middlewares/logger.js'
dotenv.config({ path: './dev.env' });

const app=express();

try {
    app.use(bodyparser.json());
    
    app.use((req, res, next) => {
        logger.info(`${req.method} ${req.url}`);
        next();
      });
      
    app.use("/objective",objroute);
    app.use("/user",objuserroute);
    
    
    app.use(ErrorHandle);
    
    mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true })
    mongoose.connection.once('open',()=>logger.info('MongoDB Connection Established'))
    .on('error',(err)=>logger.error("Error in establishing MongoDB Connection",err));
    
    app.listen(process.env.PORT || 3003, () => {
        logger.info("Listening on port " + process.env.PORT);
      });
} catch (error) {
    logger.error('Error in initialising the express app');
    throw error;
}

export default app;