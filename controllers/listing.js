const Listing=require("../Models/listing.js");

module.exports.index=async(req,res)=>{
  const allListings= await Listing.find({});
 res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res,next)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
        path:"author",
    },
  })
   .populate("owner");
    if(!listing){
       req.flash("error","Listing You requested for does not exist!");
       return res.redirect("/listings");
    }
    console.log(listing);
   res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    
    newListing.owner = req.user._id; 
    newListing.image = { url, filename };

   // --- START GEOCODING LOGIC ---
const address = req.body.listing.location; 
const query = encodeURIComponent(address);

// Make sure LOCATIONIQ_API_KEY is in your .env file and Render Environment Variables
const apiKey = process.env.LOCATIONIQ_API_KEY;
const geocodeUrl = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${query}&format=json`;

try {
    // You no longer need the custom User-Agent header; the API key handles authorization
    const response = await fetch(geocodeUrl);

    if (!response.ok) {
        req.flash("error", "Geocoding service is currently unavailable. Please try again later.");
        return res.redirect("/listings/new"); 
    }

    const data = await response.json();

    if (!data || data.length === 0) {
        req.flash("error", "Location not found. Please enter a valid address.");
        return res.redirect("/listings/new"); // Redirect back to the form
    }
    
    newListing.geometry = {
        type: "Point",
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)] // GeoJSON requires [longitude, latitude]
    };
    
} catch (err) {
    console.error("Geocoding Error:", err);
    req.flash("error", "Something went wrong while finding the location.");
    return res.redirect("/listings/new");
}
// --- END GEOCODING LOGIC ---
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.editListing=async(req,res,next)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
     if(!listing){
       req.flash("error","Listing You requested for does not exist!");
       return res.redirect("/listings");
    }
   let originalImageUrl= listing.image.url;
   originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing=async(req,res,next)=>{
    let {id}=req.params;
   let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
   if(typeof req.file!=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
   }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`); //redirected to changed show route
};

module.exports.deleteListing=async(req,res,next)=>{
    let {id}=req.params;
   listing= await Listing.findByIdAndDelete(id);
     req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};