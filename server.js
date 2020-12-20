var express= require('express')
//require body parser to identify json files.
var bodyParser=require('body-parser')
const { Socket } = require('dgram')
var app=express()

//track what is causing derprecation warning 
//in the script
process.traceDeprecation = true;

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

//connect using the default ES6 Promise library

mongoose.Promise=Promise


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
    message.save().then(()=>{
        console.log('saved')
        return Message.findOne({message:'badword'})
       })
       .then(censored =>{
           //the call back will get the result from the above then
           //function.
           if(censored){
            console.log('censored word found', censored)
            return Message.remove({_id:censored.id})
        }
        //if there are no sensored word
        io.emit('message', req.body)
        res.sendStatus(200) 

       })
       .catch((err)=>{
        res.sendStatus(500)
        return console.error(err)

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