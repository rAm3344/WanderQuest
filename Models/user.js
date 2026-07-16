const mongoose =require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

const userSchema= new Schema({
    email:{
        type:String,
        required:true
    },
    isAdmin: {
        type: Boolean,
        default: false // By default, regular users are not admins
    }
});

userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);