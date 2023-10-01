import redisClient from '../cache/redisconnection.js'; // Import the Redis client

// Function to set data in the Redis cache
const setCache = async (key, payload) => {
  // Convert payload to JSON and set it in the Redis cache
  await redisClient.set(key, JSON.stringify(payload), {
    EX: 1000, // Set an expiry time in seconds (e.g., 1000 seconds)
    NX: false // Do not only set if key does not exist
  });
};

// Function to get data from the Redis cache
const getCache = async (key) => {
  // Get the cached result for the given key from the Redis cache
  let cachedResult = await redisClient.get(key);
  return cachedResult;
};

export { setCache, getCache }; // Export the setCache and getCache functions
