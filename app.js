var express = require('express');
var app = express();

var accountController = require("./controller/account");
var productController = require("./controller/product");
var rateController = require("./controller/rate");
// var siginController = require("./controller/siginController");
// var chat = require("./controller/chat");
var server = require('http').createServer(app);
// var io = require('socket.io')(server);

// cổng cho server
var port = 8000;

//đường dẫn public cho người dùng
// app.use('/assets', express.static(__dirname + "/public"));
// app.set("view engine", "ejs"); //tạo view ejs


accountController(app);
productController(app);
rateController(app);
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