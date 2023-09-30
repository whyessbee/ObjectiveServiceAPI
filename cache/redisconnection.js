import {createClient} from 'redis';
import dotenv from 'dotenv'
dotenv.config({ path: './dev.env' });

let redisClient;
try {
    redisClient = createClient({
        password: 'password',//process.env.REDIS_PASSWORD,
        socket: {
            host: 'redis-11185.c44.us-east-1-2.ec2.cloud.redislabs.com',//process.env.REDIS_HOST,
            port: 11185//process.env.REDIS_PORT
        }
    });
    //redisClient.on("error", (error) => console.error(`Error in redis connection : ${error}`));
    redisClient.on('ready',()=>console.log('Redis Connected'));
    await redisClient.connect();
} catch (error) {
    console.error('Error in redis connection module',error);
    await redisClient.quit();
    throw error;
}

export default redisClient

