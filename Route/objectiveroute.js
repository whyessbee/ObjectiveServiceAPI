import express from 'express';
import Objective from '../model/objectives.js';
import ObjectiveUser from '../model/auth.js';
import { setCache,getCache } from '../cache/operations.js';
import moment from 'moment';
import verifyToken from '../middlewares/verifyuser.js';

const route =express.Router();

route.post('/createobjective',verifyToken,async (req,res,next)=>{
    try {
        
        
        const obUser=await ObjectiveUser.findOne({Email:req.body.AssignedTo})
            if(obUser?.length==0 || !obUser){
                res.status(400).send({Message:`No such user found with the given parameter AssignedTo: ${req.body.AssignedTo}`});
            }
            if(obUser.Role!='Developer' && req.Role =='Developer')
            res.status(400).send({Message:'You are not allowed to create an objective.'});
       
    
    
        const input={...req.body,Creator:req.Email}
        input['Audit']={
            ChangeValue:req.body.TargetValue,
            UpdatedBy:req.Email,
            UpdatedOn:"",
            CreatedOn:moment().format('YYYY-MM-DD')
        }
        input['AuditHistory']=[];
        input['AuditHistory'].push(input.Audit);
        const objective=new Objective(input);
        
        objective.save().then((data)=>{
            res.status(200).json(data);
        }).catch((err)=>{
            next(err);
        })
        
        Objective.find({}).then(data=>{
            setCache('allobjectives',data)
        })
        
    } catch (error) {
        next(error);
    }
    
    
})

route.get('/getallobjectives',verifyToken,async (req,res,next)=>{
   try {
        if(req.Role=='Developer')
        res.status(400).send({Message:'You are not authorised to fetch all the objectives.'});

        const data=await getCache('allobjectives');
        if(data){
            res.status(200).send({Objectives:JSON.parse(data),'fromCache':true});
        }
        else
        {
            Objective.find({}).then(data=>{
            setCache('allobjectives',data);
            res.status(200).send({Objectives:data,'fromCache':false});
            }).catch(err=>next(err));
        }
   } catch (error) {
        next(error);
   }
   
})

route.get('/getspecificuserobjective/:emailid',verifyToken,async (req,res,next)=>{
    try {
        const email=req.params.emailid;
        ObjectiveUser.findOne({Email:email}).then(data=>{
            if (!data)
            {
                res.status(401).send({Message:'No User with this Email exists'});
                
            }
            else if (data.Email!=req.Email && req.Role=='Developer')
            {
                res.status(400).send({Message:'Developers are not authorised to fetch objectives of anyone else other than themselves'});
                
            }

            else{
                Objective.find({AssignedTo:email}).then(data=>{
                    if(!data || data.length==0)
                    res.status(401).send({Message:'No objectives found for the given User'})
                    else
                    res.status(200).send(data);
                })
            }
         }).catch(err=>next(err));
        
        
    } catch (error) {
        next(error);
    }
    
})

route.put('/editobjective/:name',verifyToken,(req,res,next)=>{
    try {
        const objectiveName=req.params.name;
        Objective.findOne({Name:objectiveName}).then(data=>{
            if(!data)
            res.status(401).send({Message:'No objective found with the given name.'})
            else{
                if( req.Role=='Developer' ){
                    if(req.Email!=data.AssignedTo)
                    {
                        return res.status(403).send({Message:'You are not authorised to update objective of any other user except for yourself.'});
                        
                    }
                    else if(["Name","TargetValue","ValueType","Creator","DueDate","Audit","AuditHistory","AssignedTo"].includes(Object.keys(req.body).join(",")))
                    {
                        return res.status(403).send({Message:"You are not authorised to make changes to these items: Name,TargetValue,ValueType,Creator,DueDate,Audit,AuditHistory,AssignedTo"});
                        
                    }
                       
                }
                
                        const newData={...data._doc,...req.body};
                        newData.Audit["UpdatedOn"]=moment().format('YYYY-MM-DD');
                        newData.Audit.UpdatedBy=req.Email;
                        newData.Audit.ChangeValue=req.body.CurrentValue || data.CurrentValue;
                        newData.AuditHistory.push(newData.Audit);
                        
                        Objective.updateOne({ Name: objectiveName },
                        {
                          $set: {
                            ...req.body,
                            Audit:newData.Audit

                            
                          },
                          $push:{AuditHistory:newData.Audit}
                        }).then(data=>{
                            res.status(200).send({...data,Message:'Updated Successfully'});
                            Objective.find({}).then(data=>{
                                setCache('allobjectives',data);
                                }).catch(err=>next(err));
                        }).catch(err=>next(err));
                
            }
        })
    } catch (error) {
        next(error);
    }
    
})

export default route;