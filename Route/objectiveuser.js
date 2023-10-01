import jwt from 'jsonwebtoken';
import express from 'express'
import Authmodel from '../model/auth.js'
import bcrpt from 'bcrypt'

const route=express.Router();




const signin=(req,res,next)=>{
    try {
        Authmodel.findOne({Email:req.body.Email}).then((data,error)=>{
            if(error)
            next(error);
            if(!data)
            {
                res.status(404).send({Message:'User Not Found'})
            }
            const isPasswordValid=bcrpt.compareSync(req.body.Password,data.Hash);
            if(!isPasswordValid){
                res.status(401).send({Message:'Password Not Valid.Access cannot be granted!!!',AccssToken:null});
            }
            
            const token=jwt.sign({
                Email:data.Email,
                Role:data.Role
            },
            process.env.API_SECRET,
            {
                expiresIn: "1h"
            }
            )
    
            res.status(200).send({
                User:{
                    Email:data.Email,
                    Role:data.Role
                },
                Message:'Login Sucessfull.',
                AccessToken:token
            })
            
        }).catch(err=>next(err));
    } catch (error) {
        next(error);
    }
   
}

const signup=(req,res,next)=>{
    try {
        let encryptedPassword=bcrpt.hashSync(req.body.Password,8);
        let signupInfo=new Authmodel({
            Name: req.body.Name,
            Phone: req.body.Phone,
            Email: req.body.Email,
            Role:req.body.Role,
            Hash:encryptedPassword
        });

        signupInfo.save().then(data=>{
            res.status(200).json({'Result':'User Signed Up Succesfully.'});
        }).catch((error)=>next(error));
    } catch (error) {
        next(error);
    }
    
}

route.post('/signup',signup)

route.post('/signin',signin)

export default route;

