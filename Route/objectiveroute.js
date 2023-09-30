import express from 'express';
import Objective from '../model/objectives.js';
import redisClient from '../cache/redisconnection.js'
import moment from 'moment';

const route =express.Router();

route.post('/createobjective',(req,res,next)=>{
    const input={...req.body,Creator:'Yash',AssignedTo:'saran'}
    input['Audit']={
        ChangeValue:req.body.TargetValue,
        UpdatedBy:"yash",
        UpdatedOn:"",
        CreatedOn:moment().format('YYYY-MM-DD')
    }
    input['AuditHistory']=[];
    input['AuditHistory'].push(input.Audit);
    const objective=new Objective(input);
    objective.save().then((data)=>{
        Objective.find({}).then(data=>{
            redisClient.set('allusers',JSON.stringify(data),{
                EX: 1000,
                NX: false
              });
        })
        res.status(200).json(data);
    }).catch((err)=>{
        next(err);
    })
    
})

export default route;