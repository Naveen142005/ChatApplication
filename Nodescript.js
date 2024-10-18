
const express = require('express')
const app = express()
const port = 2702
const mysql = require('mysql2');
const http = require('http').Server(app)
const io = require('socket.io')(http)


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');



const connnection = mysql.createConnection({
    host:'localhost',
    user:'NaveenDb' ,
    password:'2702' ,
    database:'node'
})
connnection.connect()

app.get('/',(req,res) => {
    res.render('login')  
})

app.get('/signup', (req,res) => {
    console.log(req.body);
    res.render('signup')
})

app.post('/user', (req, res) => {
    const { username, password } = req.body;

    connnection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results, fields) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).send('An error occurred');
        } else {
            if (results.length > 0) {
                res.render('user',{username:username});
            } else {
                res.status(404).send('User not found');
            }
        }
    });
});

app.post('/',(req,res) => {
    const {username, password} = req.body;

    connnection.query('INSERT INTO users (username, password) VALUES (?, ?)',[username,password],(err, result)=>{
        if(err){
            res.status(400).json(false);
        }
        else res.status(200).json(true)
})})

http.listen(port)



let connectedUsers = {};

io.on('connection' , (socket)=>{

    socket.on('setUsername', (username) => {
        console.log(username);
        socket.username = username;
        connectedUsers[username] = socket.id;
    });

    socket.on('clientmessage' , ({to , mes}) => {
        console.log(mes +"from server");
        if(connectedUsers[to]){
            socket.to(connectedUsers[to]).emit('servermessage' , {from : socket.username , mes})
        }
        else{
            socket.emit('message', { from: 'Server', message: `User '${to}' is not online` });
        }
    })


    socket.on('disconnect',(s)=>{
        console.log("Connection disconnect");
        delete connectedUsers[socket.username];
    })
})


