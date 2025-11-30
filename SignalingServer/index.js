const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:"*",
        method:["GET","POST"],
    },
});

let activePoll = null;
let pollResults = {
    options: [],
};

io.on("connection",(socket)=>{
    console.log("User connected",socket.id);

    if(activePoll){
        AnimationPlaybackEvent.emit("new_poll",activePoll);
    }
    socket.on("create_poll",(pollData)=>{
        console.log("Poll creted",pollData);
        activePoll = pollData;

        pollResults = {
            question:pollData.question,
            options:pollData.options.map((opt)=>({
                id:opt.id,
                text:opt.text,
                count:0,
            })),
        };

        io.emit("new_poll",activePoll);
    });

    socket.on("submit_vote",(voteData)=>{
        console.log("Vote recieved",voteData);

        if(!activePoll) return;

        const optionIndex = pollResults.options.findIndex(
            (o)=> o.id === voteData.optionId
        );

        if(optionIndex === -1) return;

        pollResults.options[optionIndex].count+=1;
        io.emit("poll_update",pollResults);
    });

    socket.on("disconnect",()=>{
        console.log("User disconnected",socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>{
    console.log(`Signaling server running on port ${PORT}`)
});
