const express = require("express");
const app = express();
const mongoose = require("mongoose").mongoose; //importing mongoose
app.use(express.json());
const cors = require("cors");
app.use(cors());
const zxcvbn = require('zxcvbn');
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
    const strength = zxcvbn(password);
    if (strength.score < 3) {
        return res.status(400).send({ error: 'password is too weak' });

    }
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
        const options = { expiresIn: '1h' };
        const token = jwt.sign({ email: user.email }, JWT_SECRET, options);

        if (res.status(201)) {
            return res.json({ status: "ok", data: token });

        }
        return res.json({ error: "error" });

    } else {
        res.status(401).json({ error: "Invalid email or password" });
    }

});


// app.get('/secure', (req, res) => {
//     // Get the JWT from the request headers
//     const token = req.headers.authorization;
//     // Verify the JWT using the secret
//     try {
//         const decoded = jwt.verify(token, JWT_Secret);
//         res.json({ message: 'Authenticated', user: decoded.email });
//     } catch (err) {
//         res.status(401).json({ message: 'Unauthorized' });
//     }
// });
app.post("/userData", async(req, res) => {
    const { token } = req.body;
    try {
        const user = jwt.verify(token, JWT_SECRET, (err, res) => {
            if (err) {
                return "token expired";
            }
            return res;
        });

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
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' })
    }
});
// get users from the database

app.get('/users', (error, res) => {

    User.find((err, result) => {
        if (err) { res.send(err) }
        res.send(result)

    });





})

app.listen(5000, () => {
    console.log("server running at port 5000")
})