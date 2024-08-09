const fs = require("fs");

const express = require("express");

const path = require("path");

const { v4:uuidv4 } = require("uuid")

const ticketAPIS = express.Router();

const ticketsFilePath = path.join(__dirname, "tickets.json");



//GET Request
ticketAPIS.get("/", (req, res) => {
  fs.readFile(ticketsFilePath, "utf-8", (error, data) => {
    if (error) {
      console.log("Error reading file", error);
      res.status(500).json({ error: "failed to read" });
    }
    // console.log(data);
    res.send(data);
  });
});



//POST Request
ticketAPIS.post("/addticket", (req, res) => {
  const addticket = req.body;

  if (!addticket.title){
    res.status(400).json({error: "title is required"})
  }

  addticket.id = uuidv4();

  fs.readFile(ticketsFilePath, "utf-8", (error, data) => {
    if (error) {
      console.log("Error reading file", error);
      res.status(500).json({ error: "failed to read" });
    }

    let newData;
    try{
        newData = JSON.parse(data);
    }catch{
        newData = []
    }

    const duplicateTitle = newData.some(newData => newData.title === addticket.title);
    const duplicateTeam = newData.some(newData => newData.team === addticket.team);
    const duplicateAssignee = newData.some(newData => newData.assignee === addticket.assignee);
    
    if (duplicateTitle) {
      return res.status(400).json({ error: "title already exists" });
      }

    if (duplicateTeam) {
      return res.status(400).json({ error: "team already exists" });
      }
      
    if (duplicateAssignee) {
      return res.status(400).json({ error: "assignee already exists" });
      }
        
        newData.push(addticket);

    fs.writeFile(ticketsFilePath, JSON.stringify(newData), "utf-8", (error) => {
      if (error) {
        console.log("Error writing file", error);
        res.status(500).json({ error: "failed to write file" });
      }
      res.send(addticket);
    });
  });
});



//PUT Request
ticketAPIS.put("/:id", (req, res) => {
  const ticketId = req.params.id;
  const updateTicket = req.body;

  fs.readFile(ticketsFilePath, "utf-8", (err, data) => {
    if (err){
      res.status(500).json({ error: "Internal Server Error"});

    }

    let tickets = JSON.parse(data)

    const duplicateTitle = tickets.some(ticket => ticket.title === updateTicket.title);
    const duplicateTeam = tickets.some(ticket => ticket.team === updateTicket.team);
    
    if (duplicateTitle) {
      res.status(400).json({ error: "title already exists" });
    }
    
    if (duplicateTeam) {
      res.status(400).json({ error: "Team already exists" });
    }

  
    const index = tickets.findIndex(ticket => ticket.id === ticketId)
    if (index !== -1){
      tickets[index] = updateTicket;


      fs.writeFile(ticketsFilePath, JSON.stringify(tickets,null,2), "utf-8", (err) => {
        if (err){
          res.status(500).json({ error: "failed to update ticket"})
        }
        console.log(`updated ticket with id ${ticketId} successfully`)
        res.json(tickets[index]);
      });
    }
    else{
      res.status(404).json({ error: "ticket not found"})
    }
    });

});



//DELETE request
ticketAPIS.delete("/:id", (req, res) => {
  const idToDelete = req.params.id;

  fs.readFile(ticketsFilePath, "utf-8", (error, data) => {
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
     
     const filterData = newData.filter(ticket => ticket.id !== idToDelete);

     if (filterData.length === newData.length) {
      res.status(404).json({ error: "Ticket not found" });
    }
  
      fs.writeFile(ticketsFilePath, JSON.stringify(filterData), "utf-8", (error) => {
        if (error) {
          console.log("Error writing file", error);
          res.status(500).json({ error: "failed to write file" });
        }
        res.status(201).send("Data Deleted Successfully!");
      })
    });

});

module.exports = ticketAPIS;
