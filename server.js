var express= require('express')
//require body parser to identify json files.
var bodyParser=require('body-parser')
const { Socket } = require('dgram')
var app=express()


//let's set the socket.io for the backend
var http=require('http').Server(app)
var io=require('socket.io')(http)

//Lets get the mongoose connection by requiring it.
var mongoose=require('mongoose')
const { stringify } = require('querystring')



app.use(express.static(__dirname))
//add body parser as a middleware.
app.use(bodyParser.json())


app.use(bodyParser.urlencoded({extended:false}))
//let's create a connection to the mongodb using the link
var dbUrl='mongodb+srv://pita:kTHy17W339spuDJM@cluster0.0thoj.mongodb.net/nodejs?retryWrites=true&w=majority'

var Message=mongoose.model('Message',{
    name:String,
    message:String
})

app.get('/messages', (req, res)=>{
    Message.find({},(err, messages)=>{
        res.send(messages)
    })
    
})

app.post('/messages', (req, res)=>{
    //create a message object to save items to db
    var message=new Message(req.body)

    //save and return if an error occurs.
    message.save((err)=>{
        if(err){
            sendStatus(500)
        }
       Message.findOne({message:'badword'}, (err,censored)=>{
           if(censored){
               console.log('censored word found', censored)
               Message.remove({_id:censored.id},(err)=>{
                   console.log('removed censored message')
               })
           }
       })
        io.emit('message', req.body)
        res.sendStatus(200)
    })
 
})

io.on('connection', (socket)=>{
    console.log('a user connected')
})


//connect to the mongoose and incase there is an 
//error just show the message.
mongoose.connect(dbUrl,{useNewUrlParser: true},(err)=>{
    console.log('mongo db connection.',err)

})
var server= http.listen(3000, ()=>{
    console.log('server is listening on port', server.address().port)
})