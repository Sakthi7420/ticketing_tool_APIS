const fs = require("fs");

const express = require("express");

const { v4: uuidv4 } = require('uuid');

const path = require('path');

const teamAPIS = express.Router();

const teamsFilePath = path.join(__dirname,"teams.json")



//GET Request
teamAPIS.get('/', (req,res) =>{
    fs.readFile(teamsFilePath, "utf-8", (error, data) => {
        if (error){
            console.log("Error reading file", error)
            res.status(500).json({error: 'failed to read'})
        }
        // console.log(data);
        res.send(data)
})
});


//POST Request
teamAPIS.post('/addteam', (req, res) => {
    const newTeam = req.body;

    if (!newTeam.teamName){
      res.status(400).json({error: "Team name is required"})
    }
    if (!newTeam.members){
      res.status(400).json({error: "members are required"})
    }

    newTeam.id = uuidv4();
    
    fs.readFile(teamsFilePath, "utf-8", (error, data) => {
        if (error) {
          console.log("Error reading file", error);
          res.status(500).json({ error: "failed to read" });
        }
    
        let newData;
        try{
            newData = JSON.parse(data); //it converts 
        }catch{
            newData = []
        }

        const duplicateTeamName = newData.some(newData => newData.teamName === newTeam.teamName);
        const duplicateTeamMembers = newData.some(newData => newData.members === newTeam.members);

        if (duplicateTeamName) {
          return res.status(400).json({ error: "Team name already exists" });
        }

        if (duplicateTeamMembers) {
          return res.status(400).json({ error: "Members already exists" });
        }
       
        newData.push(newTeam);
    
        fs.writeFile(teamsFilePath, JSON.stringify(newData), "utf-8", (error) => {
          if (error) {
            console.log("Error writing file", error);
            res.status(500).json({ error: "failed to write file" });
          }
          res.send(newTeam);
        });
      });
});



// PUT Request
teamAPIS.put('/:id', (req,res) => {
    const teamId = req.params.id;
    const updateNewTeam = req.body;

    fs.readFile(teamsFilePath, "utf-8", (err, data) => {
      if (err){
        res.status(500).json({ error: "Internal Server Error"});
      }

      let teams = JSON.parse(data);

      const duplicateTeamName = newData.some(newData => newData.teamName === newTeam.teamName);
      if (duplicateTeamName){
        res.status(400).json({ error: "Duplicate teamName found!"})
      }

      const index = teams.findIndex(team => team.id === teamId);
      if (index !== -1){
        teams[index] = updateNewTeam;

        fs.writeFile(teamsFilePath, JSON.stringify(teams,null,2), "utf-8", (err) => {
          if (err){
            res.status(500).json({ error: "failed to update team"})
          }
          console.log(`updated team with id ${teamId} successfully`)
          res.json(updateNewTeam);
        });
      }
      else{
        res.status(404).json({ error: "team not found"})
      }
    })
});



//DELETE request
teamAPIS.delete('/:id', (req,res) => {
    const idToDelete = req.params.id;
    fs.readFile(teamsFilePath, "utf-8", (error, data) => {
        if (error) {
          console.log("Error reading file", error);
          res.status(500).json({ error: "failed to read" });
        }
    
        let newData;
        try{
            newData = JSON.parse(data); //it converts json string to js object
        }catch{
            newData = []
        }
       
       const filterData = newData.filter(team => team.id !== idToDelete);
    
        fs.writeFile(teamsFilePath, JSON.stringify(filterData), "utf-8", (error) => {
          if (error) {
            console.log("Error writing file", error);
            res.status(500).json({ error: "failed to write file" });
          }
          res.status(201).send("Data Deleted Successfully!");
        });
      });

})


module.exports = teamAPIS;