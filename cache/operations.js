import redisClient from '../cache/redisconnection.js'

const setCache=async(key,payload)=>{
    redisClient.set(key,JSON.stringify(payload),{
        EX: 1000,
        NX: false
      });
}

const getCache=async(key)=>{
    let cachedResult=await redisClient.get(key);
    return cachedResult;
}

export {setCache,getCache};