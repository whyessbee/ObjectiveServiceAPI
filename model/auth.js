import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

const ObjectiveAuth = new mongoose.Schema({
    Name: String,
    Phone: { type: String, unique: true },
    Email: { type: String, unique: true },
    Role:String,
    Hash:String
});

ObjectiveAuth.plugin(uniqueValidator);
export default mongoose.model('ObjectiveUsers',ObjectiveAuth);