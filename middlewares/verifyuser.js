import jwt from 'jsonwebtoken'
import Authmodel from '../model/auth.js'

const verifyToken=(req,res,next)=>{
    try {
        
            if( req.headers.authorization && req.headers.authorization.split(' ')[0].toLowerCase()==='jwt')
            {
                jwt.verify(req.headers.authorization.split(' ')[1],
                process.env.API_SECRET,
                (error,decode)=>{
                    if(error){
                        req.Role=undefined;
                        req.Email=undefined;
                        next(error)
                    }
                Authmodel.findOne({Email:decode.Email}).then((data,err)=>{
                    if(data)
                    {
                        req.Role=data.Role;
                        req.Email=decode.Email;
                        next();
                    }
                    else{
                        res.status(500).send(err);
                    }
                }).catch((err)=>{
                    next(err)
                })

                }
                )
            }
            else
            {
                req.role=undefined;
                req.email=undefined;
                next( new Error('No Token Provided'));
            }
    } catch (error) {
        next(error);
    }

}

export default verifyToken;