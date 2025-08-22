const apps = require('express')();
require("dotenv").config();
const passport = require('passport');
const bodyParser = require('body-parser');
const noc = require('no-console');
const cors = require('cors');
const mongoose = require("mongoose");



const { createServer } = require('node:http');
const { Server } = require('socket.io');
const server = createServer(apps);
const io = new Server(server);

// Bootstrap schemas, models
require("./bootstrap");

// App configuration
noc(apps);
apps.use(bodyParser.json());
apps.use(passport.initialize());
apps.use(cors());


io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    socket.emit('updatedId', socket.id)
    socket.on('join', async (data) => {
        socket.join(data)
        io.to(data).emit('joined-user', socket.id)
    })

    socket.on('joinadmin', () => {
        socket.join('admin');
    })
    socket.on('joinRoom', async (data) => {
        const Chat = mongoose.model("Chat");
        const ChatConnection = mongoose.model("ChatConnection");
        let con = await ChatConnection.findOne({ conn_id: data.conn_id }).populate('user', 'username profile').populate('customer', 'username profile')
        if (!con) {
            const c = await ChatConnection.create(data)
            con = await ChatConnection.findOne({ conn_id: c.conn_id }).populate('user', 'username profile').populate('customer', 'username profile')
        }
        socket.join(data.conn_id)
        // socket.emit(con)
        const getAllChat = await Chat.find({ connection: con._id })
            .populate("sender receiver", "username profile")
            .sort({ createdAt: -1 });
        socket.emit("messages", {getAllChat,con});
    });
    socket.on('chatuser', async (data) => {
        const ChatConnection = mongoose.model("ChatConnection");
        let query ={
            type:data.type
        }
        if(data.from){
            query.user=data.id
        }else{
            query.customer=data.id
        }
        socket.join(data.id)
        let con = await ChatConnection.find(query).populate('user customer', 'username profile').sort({'updatedAt':-1})
        // socket.join(data.conn_id)
        socket.emit('userlist',con)
    });
    socket.on('clearConnection', async (data) => {
        const Connection = mongoose.model("Connection");
        // await mongoose.connection.db.collection('Connections').drop();
        await Connection.collection.drop();


    });

    socket.on('getAllConnection', async (data) => {
        const Connection = mongoose.model("Connection");
        let con = await Connection.findOne({ type: data.type })
        socket.emit('getallconnection',con || [])
    });

    socket.on("getMessages", async (data) => {
        const Chat = mongoose.model("Chat");
        const getAllChat = await Chat.find({ connection: data.conn_id })
            .populate("sender receiver", "username profile").populate('connection')
            .sort({ createdAt: -1 });
        socket.emit("messages", getAllChat);
    });

    socket.on("createMessage", async (data) => {
        const Chat = mongoose.model("Chat");
        const ChatConnection = mongoose.model("ChatConnection");
        const con =await ChatConnection.findOneAndUpdate({conn_id:data.conn_id},{lastmsg:data.message}).populate("user customer", "username profile")
        const chat = new Chat(data);
        await chat.save();
        const getAllChat = await Chat.find({ connection: data.connection })
            .populate("sender receiver", "username profile")
            .sort({ createdAt: -1 });
            let query ={
                type:data.type,
                [data.to]:data.receiver
            }
            console.log(query)
        let cont = await ChatConnection.find(query).populate('user customer', 'username profile').sort({'updatedAt':-1})
        io.to(data[data.to]).emit("userlist", cont);
        io.to(data.conn_id).emit("allmessages", getAllChat);
        socket.emit("messages", {getAllChat,con});
    });


    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });

});

//Database connection
require('./db');
//Passport configuration
require('./passport')(passport);
//Routes configuration
require("./../src/routes")(apps);

const app = server;
module.exports = app;