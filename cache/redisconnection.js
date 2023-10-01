import { createClient } from 'redis';
import logger from '../middlewares/logger.js';
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(),'dev.env') }); // Configuring dotenv to use a specific environment file


let redisClient; // Declare a variable to hold the Redis client

try {
    // Create a Redis client with the specified configuration
    redisClient = createClient({
        password: process.env.REDIS_PASSWORD, // Redis password (change this to use process.env.REDIS_PASSWORD)
        socket: {
            host: process.env.REDIS_HOST, // Redis server host (change this to use process.env.REDIS_HOST)
            port: process.env.REDIS_PORT // Redis server port (change this to use process.env.REDIS_PORT)
        }
    });

    // Event handler for when the Redis client is ready
    redisClient.on('ready', () => logger.info('Redis Connected'));

    // Connect to the Redis server
    await redisClient.connect();

} catch (error) {
    // Handle errors in the Redis connection
    logger.error('Error in redis connection module', error);

    // Quit the Redis client if an error occurs during setup
    if (redisClient) {
        await redisClient.quit();
    }

    throw error; // Rethrow the error for higher-level handling

}

export default redisClient; // Export the Redis client for use in other parts of the application
