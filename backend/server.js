require("dotenv").config();
const http = require('http') 
const port = process.env.PORT || 3000;
const  app = require('./app.js') ;


const server = http.createServer(app);



server.listen(port, () => {
console.log(`Server is listening on port ${port}`);
})
