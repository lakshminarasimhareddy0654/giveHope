const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB Connection Error ', error);
    });

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String
});


const DonarSchema = new mongoose.Schema({
   
    fullName: String,
    email: String,
    amount: Number,
    donationReason: String,
    paymentMethod: String

});

const UserModel = mongoose.model('users', userSchema);

const donate = mongoose.model('donate', DonarSchema);













// for registration
app.post("/register", async (req, res) => {
    let { email, username, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, email, and password.' });
    }

    try {
        // Check if the email or username is already taken
        const existingEmailUser = await UserModel.findOne({ email });
        if (existingEmailUser) {
            return res.status(400).json({ message: 'Email is already in use.',isinUse:true });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new UserModel({ email, username, password: hashedPassword });
        try {
            await newUser.save();
            console.log('User registered successfully.');
            res.status(201).json({ message: 'User registered successfully.' });
        } catch (error) {
            console.error('Error during registration: ', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    } catch (error) {
        console.error('Error during registration: ', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// for login
app.post("/login", async (req, res) => {
    let { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        // Check if the user exists
        const user = await UserModel.findOne({
            $or: [
                { email: usernameOrEmail },
                { username: usernameOrEmail }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or username.' ,invalid:true});
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password.' ,invalid:true});
        }

        console.log('User logged in successfully.');
        const token = jwt.sign({ email: user.email, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'User logged in successfully.',
        token: token,
        username: user.username,
        email: user.email
         });
    } catch (error) {
        console.error('Error during login: ', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});



app.post("/donate", async (req, res) => {
    const { fullName, email, amount, paymentMethod, donationReason } = req.body;
    console.log(req.body);
    // Check if all required fields are provided
    if (!fullName || !email || !amount || !paymentMethod || !donationReason) {
        return res.status(400).json({ message: 'Please provide all the required fields.' });
    }

    try {
        // Create a new donation entry
        const newDonation = new donate({ 
            fullName, 
            email, 
            amount, 
            paymentMethod, 
            donationReason 
        });
        let existingEmailUser =await donate.findOne({ email });
        if(existingEmailUser){
            await donate.updateOne(
                { email: email },
                { $inc: { amount: amount } }  // This increments the amount field by the specified amount
            );
        }
        
        // Save the donation to the database
        else{
        await newDonation.save();
        }

        // Log the success
        console.log('Donation added successfully.');

        // Respond with a success message
        res.status(201).json({ message: 'Donation added successfully.' });
    } catch (error) {
        // Log any errors
        console.error('Error during donation: ', error);

        // Respond with an error message
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.get("/donars", async (req, res) => {
    console.log("entered into donars page")
    try {
        // Fetch all donors from the database
        const donars = await donate.find();
        
        // Log and send the donars list
        console.log(donars);
        res.status(200).json(donars);
    } catch (error) {
        // Log any errors
        console.error('Error fetching donars: ', error);

        // Respond with an error message
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.post("/update",async (req,res)=>{
    let data=req.body
    if(!data.username || !data.email || !data.currentPassword || !data.newPassword){
        res.json({message:"all fields required"})
    }
    try{
        const user = await UserModel.findOne({
            $and: [
                { email: data.email },
                { username: data.username }
            ]
        });

    if(!user){
        res.json({message:"enter valid username and email"})
    }else{
        const isPasswordValid = await bcrypt.compare(data.currentPassword,user.password);
        console.log(data.currentPassword,user.password)
        console.log(isPasswordValid)
        try{
            if (isPasswordValid) {
                // Hash the new password
                const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);

                // Update the user details
                user.password = hashedNewPassword;

                await user.save();

                return res.json({ message: "User details updated successfully" });
            } else {
                return res.json({ message: "Invalid current password" });
            }
        }
        catch{
            res.json({message:"error occured during updation"})
        }
    }
    }
    catch(err){
        console.log(err)
    }

})



app.post("/delete",async (req,res)=>{

   let data=req.body
    if(!data.username || !data.email || !data.password){
        res.json({message:"all fields required"})
    }
    try{
        const user = await UserModel.findOne({
            $and: [
                { email: data.email },
                { username: data.username }
            ]
        });

    if(!user){
        res.json({message:"enter valid username and email"})
    }else{
        const isPasswordValid = await bcrypt.compare(data.password,user.password);
        console.log(data.password,user.password)
        console.log(isPasswordValid)
        try{
            if (isPasswordValid) {
                await UserModel.deleteOne({ email: data.email });
                return res.json({ message: "User deleted successfully" });
            } else {
                return res.json({ message: "Invalid password" });
            }
        }
        catch{
            res.json({message:"error occured during deletion"})
        }
    }
    }
    catch(err){
        console.log(err)
    }

})










app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});