const path =require('path')
const http=require('http')
const express= require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generatemessage,generateLocationmessage}= require("./utils/messages")
const app=express()
const server= http.createServer(app)
const io=socketio(server)
const { adduser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
var count=0;
io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', (options, callback) => {
        const { error, user } = adduser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generatemessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generatemessage('Admin', `${user.username} has joined!`))
         io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendmessage',(message,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed !')
        }
        console.log( "jyoti username:"+user.username)
        io.to(user.room).emit('message', generatemessage(user.username, message))
        callback()
    })



socket.on('sendlocation', (coords, callback) => {
    const user = getUser(socket.id)
    io.emit(user.room).emit('locationMessage', generateLocationmessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
})

*9
socket.on('disconnect',()=>{
    const user = removeUser(socket.id)

    if (user) {
      
        io.to(user.room).emit('message', generatemessage('Admin',`${user.username} has left!`))
    }
})
    // socket.emit('countupdated',count)
    // socket.on('increment',()=>{
    //     count++;
    //     io.emit('countupdated',count)
    // })
})
     
server.listen(port,()=>{
    console.log ("Server up on port:"+port)
})