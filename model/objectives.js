import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

const ObjectiveSchema = new mongoose.Schema({
    Name: {type:String,required:true,unique:true},
    TargetValue: { type: String,required:true },
    CurrentValue: { type: String,default:"" },
    ValueType:{type:String,required:true},
    Creator:{type:String,required:true},
    DueDate:{type:Date,required:true},
    Progress:{type:Number,max:100,min:0,default:0},
    Audit:{
        ChangeValue:String,
        UpdatedBy:String,
        UpdatedOn:Date,
        CreatedOn:Date
    },
    AuditHistory:{type:Array},
    AssignedTo:{type:String,required:true}
});

ObjectiveSchema.plugin(uniqueValidator);
export default mongoose.model('Objective',ObjectiveSchema);