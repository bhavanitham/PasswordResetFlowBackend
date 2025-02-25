const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userDetailsSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    stringToken:{
        type:String,
        default:''
    }
});

userDetailsSchema.pre('save',async function(next){
if(this.isModified('password')){
    const salt =await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
}
next();
})

const userModel = mongoose.model('userRegisteredData',userDetailsSchema);
module.exports=userModel;
