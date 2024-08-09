const fs = require("fs");

const path = require('path');

const { v4: uuidv4 } = require('uuid');

const express = require("express");

const userAPIS = express.Router();

const usersFilePath = path.join(__dirname,"users.json");



//GET Request
userAPIS.get('/', (req,res) =>{
    fs.readFile(usersFilePath, "utf-8", (error, data) => {
        if (error){
            console.log("Error reading file", error)
            res.status(500).json({error: 'failed to read'})
        }
        // console.log(data);
        res.send(data)
    })
});



//POST Request

// ValidateEmail
const validateEmail = (emailId) =>{
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(emailId)
}

//ValidatePhoneNumber
const validatePhoneNumber = (PhoneNumber) =>{
  const regex = /^\d{10}$/;
  return regex.test(PhoneNumber)
}

const isDuplicate = (newUser,newData) => {
  return newData.some(user => 
    user.email === newUser.email || user.phone === newUser.phone);
}

userAPIS.post('/adduser', (req, res) => {
    const newUser = req.body;
    
    if (!validateEmail(newUser.emailId)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    if (!validatePhoneNumber(newUser.phoneNumber)) {
      return res.status(400).json({ error: "Invalid PhoneNumber" });
    }

    newUser.id = uuidv4();


    
    fs.readFile(usersFilePath, "utf-8", (error, data) => {
        if (error) {
          console.log("Error reading file", error);
          res.status(500).json({ error: "failed to read" });
        }

        let newData = JSON.parse(data);

        if (!Array.isArray(newData)) {
          newData = []; // Initialize as an empty array if not already an array
      }

      let duplicateFields = [];
    if (newData.some(user => user.emailId === newUser.emailId)) duplicateFields.push("email");
    if (newData.some(user => user.phoneNumber === newUser.phoneNumber)) duplicateFields.push("phone number");

    if (duplicateFields.length > 0) {
      const errorMessage = `User with same ${duplicateFields.join(", ")} already exists`;
      res.status(400).json({ error: errorMessage });
    }
  
        newData.push(newUser);
    
        fs.writeFile(usersFilePath, JSON.stringify(newData,null,2), "utf-8", (error) => {
          if (error) {
            console.log("Error writing file", error);
            res.status(500).json({ error: "failed to write file" });
          }
          res.send(newUser);
        });
      });
});



//PUT Request
userAPIS.put('/:id', (req,res) =>{
  const userId = req.params.id;
  const updateNewUser = req.body;

  fs.readFile(usersFilePath, "utf-8", (err, data) => {
    if (err){
      res.status(500).json({ error: "Internal Server Error"});
    }

    let users = JSON.parse(data);

    const duplicateFirstName = users.some( user => user.firstName === updateNewUser.firstName);
    const duplicateemailId = users.some(user => user.emailId === updateNewUser.emailId);
    const duplicatephoneNumber = users.some(user => user.PhoneNumber === updateNewUser.PhoneNumber);
    const duplicateemployeeId = users.some( user => user.employeeId === updateNewUser.employeeId);
    const duplicateteamId = users.some( user => user.teamId === updateNewUser.teamId);

    if(duplicateemailId){
      res.status(400).json({ error: "emailId aldready exists"})
    }
    if(duplicatephoneNumber){
      res.status(400).json({ error: "PhoneNumber aldready exists"})
    }
    if(duplicateFirstName){
      res.status(400).json({ error: "firstName aldready exists"})
    }
    if(duplicateemployeeId){
      res.status(400).json({ error: "employeeId aldready exists"})
    }
    if(duplicateteamId){
      res.status(400).json({ error: "teamId aldready exists"})
    }


    const index = users.findIndex(user => user.id === userId);
    if (index !== -1){
      users[index] = updateNewUser;

      fs.writeFile(usersFilePath, JSON.stringify(users,null,2), "utf-8", (err) => {
        if (err){
          res.status(500).json({ error: "failed to update User"})
        }
        console.log(`updated User with id ${userId} Successfully`)
        res.json(updateNewUser);
      });
    }
    else{
      res.status(404).json({ error: "User not found"});
    }
  });
});



//DELETE request
userAPIS.delete('/:id', (req,res) =>{
  const idToDelete = req.params.id;

  fs.readFile(usersFilePath, "utf-8", (error, data) => {
      if (error) {
        console.log("Error reading file", error);
        res.status(500).json({ error: "failed to read" });
      }
  
      let newData = JSON.parse(data); //it converts json string to js object
   
     
     const filterData = newData.filter(user => user.id !== idToDelete);
  
      fs.writeFile(usersFilePath, JSON.stringify(filterData), "utf-8", (error) => {
        if (error) {
          console.log("Error writing file", error);
          res.status(500).json({ error: "failed to write file" });
        }
        res.status(201).send("Successfully Deleted")
      });
    });

})


module.exports = userAPIS;

