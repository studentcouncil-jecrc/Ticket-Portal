import http from 'http'
const port = process.env.PORT || 3000;
import app from './app.js';


const server = http.createServer(app);



server.listen(port, () => {
console.log(`Server is listening on port ${port}`);
})
