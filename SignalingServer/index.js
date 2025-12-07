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
        socket.emit("new_poll",activePoll);
    }
    socket.on("create_poll",(pollData)=>{
        console.log("Poll creted",pollData);
        activePoll = pollData;

        if (pollData.options) {
            pollResults = {
                question: pollData.question,
                options: pollData.options.map((opt) => ({
                    id: opt.id,
                    text: opt.text,
                    count: 0,
                })),
            };
        } else {
            pollResults = {
                question: pollData.question,
                options: [],
            };
        }

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

    socket.on("end_poll", () => {
        console.log("Poll ended");
        activePoll = null;
        pollResults = { options: [] };
        io.emit("poll_ended");
    });

    socket.on("submit_descriptive_vote", (data) => {
        console.log("Descriptive vote received", data);
        io.emit("receive_descriptive_vote", data);
    });

    socket.on("disconnect",()=>{
        console.log("User disconnected",socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>{
    console.log(`Signaling server running on port ${PORT}`)
});
