const express = require("express");

const port = 3001

const app = express();

app.use(express.json())

const ticketAPIS = require("./APIS/tickets");
const teamAPIS = require("./APIS/teams");
const userAPIS = require("./APIS/users");


app.use('/tickets',ticketAPIS);
app.use('/teams',teamAPIS);
app.use('/users',userAPIS);


app.listen(port, (error) => {
    if (error){
        console.log('Server start failed')
    }
    console.log(`Server Running on ${port} Production`);   
})



