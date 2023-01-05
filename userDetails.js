const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema(
    {
        name: String,
        role: String,
        email: {type: String, unique: "true" },
        password: String,
        
    },
    {
        collection: "userInfo",
    }
);

mongoose.model("UserInfo",UserDetailsSchema);