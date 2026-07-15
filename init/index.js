const mongoose=require("mongoose");
const initData=require("./data.js");

const Listing=require("../Models/listing.js");

const MONGO_URL='mongodb://127.0.0.1:27017/wanderQuest';

main().then((res)=>{
         console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB= async ()=>{
    await Listing.deleteMany({});
   initData.data= initData.data.map((obj)=>({...obj,
    owner:'6a52978c0db6adf83ab6af42',
}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();