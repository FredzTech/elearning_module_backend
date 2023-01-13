const express = require("express");
const app = express();
const mongoose = require("mongoose"); //importing mongoose
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const JWT_SECRET =
    "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";



const mongoUrl = "mongodb+srv://elearning-users:bitnami@cluster1.dmlvszx.mongodb.net/?retryWrites=true&w=majority";

mongoose
    .connect(mongoUrl, {
        useNewUrlParser: true,
    })
    .then(() => {
        console.log("Connected to database");

    })
    .catch((e) => console.log(e));



//handling user registration
require("./userDetails");
const User = mongoose.model("UserInfo");
app.post("/register", async(req, res) => {
    const { name, email, password, role } = req.body;
    const encryptedPassword = await bcrypt.hash(password, 10); //encrypting the password
    try {
        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.send({ error: "user exists" })
        }
        await User.create({
            name,
            email,
            password: encryptedPassword,
            role,

        });
        res.send({ status: "ok" })
    } catch (error) {
        res.send({ status: "error" });
        console.log(error);

    }

});

//handling the login 
app.post("/login", async(req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ error: "User Not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ email: user.email }, JWT_SECRET, {
            expiresIn: 10,
        });

        if (res.status(201)) {
            return res.json({ status: "ok", data: token });
            console.log(token)
        } else {
            return res.json({ error: "error" });
        }
    }
    res.json({ status: "error", error: "InvAlid Password" });
});

app.post("/userData", async(req, res) => {
    const { token } = req.body;
    try {
        const user = jwt.verify(token, JWT_SECRET, (err, res) => {
            if (err) {
                return "token expired";
            }
            return res;
        });
        console.log(user);
        if (user == "token expired") {
            return res.send({ status: "error", data: "token expired" });
        }

        const useremail = user.email;
        User.findOne({ email: useremail })
            .then((data) => {
                res.send({ status: "ok", data: data });
            })
            .catch((error) => {
                res.send({ status: "error", data: error });
            });
    } catch (error) {}
});

app.listen(5000, () => {
    console.log("server running at port 5000")
})