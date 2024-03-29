var express = require("express");
const bodyParser = require("body-parser");
var app = express();
const cors = require("cors");
var server = require("http").createServer(app);

//Add new
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use("/assets", express.static(__dirname + "/public"));
// app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'pug')
app.use(express.static('public'));
app.use(express.static('views'));
// parse application/json
app.use(bodyParser.json());
app.use(cors());



// cổng cho server
var port = 8000;

var accountController = require("./controller/account");
var productController = require("./controller/product");
var rateController = require("./controller/rate");
var recommendController = require("./controller/recommend");
var categoryController = require("./controller/category");
var cartController = require("./controller/cart");
var paypalController = require("./controller/paypal");
var addressController = require("./controller/address");
var orderController = require("./controller/order");
var chatbotController = require("./controller/chatbot");

var shopController = require("./controller/shop");

accountController(app);
productController(app);
rateController(app);
recommendController(app);
categoryController(app);
cartController(app);
paypalController(app);
addressController(app);
orderController(app);
shopController(app);
chatbotController(app);
// siginController(app);
// chat(app);

// io.on('connection', socket => {
//     console.log("hello");
//     socket.emit('message', "wellcom")
// });

//server đang lắng nghe các request
app.listen(port, function () {
	console.log("server is listening on port: ", port);
});
