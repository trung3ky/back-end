var express = require('express');
const bodyParser = require('body-parser')
var app = express();
const cors = require('cors')


var server = require('http').createServer(app);

app.use('/assets', express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(cors())

// cổng cho server
var port = 8000;

var accountController = require("./controller/account");
var productController = require("./controller/product");
var rateController = require("./controller/rate");
var recommendController = require("./controller/recommend");

accountController(app);
productController(app);
rateController(app);
recommendController(app);
// siginController(app);
// chat(app);

// io.on('connection', socket => {
//     console.log("hello");
//     socket.emit('message', "wellcom")
// });


//server đang lắng nghe các request
app.listen(port, function() {
    console.log("server is listening on port: ", port);
});