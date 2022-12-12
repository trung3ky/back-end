var bodyParser = require("body-parser");
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require("./db");
const uuid = require("uuid");
const FullAddress = require("../const/address");
var TimeNow = require("./atom");
const fastcsv = require("fast-csv");
const fs = require("fs");

module.exports = function (app) {
    app.get("/full-address", urlencodeParser, function (req, res) {
        res.send(FullAddress);
    });

    app.get("/address/all/:user_id", function (req, res) {
        const userId = req.params["user_id"];
        var sql = "select * from address where user_id = '" + userId + "' ";
        connection.query(sql, function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    });
    
    app.post("/address/create-address/:user_id", urlencodeParser, function (req, res) {
        const userId = req.params["user_id"];
        var name = req.body.name;
        var phone = req.body.phone;
        var city = req.body.city;
        var district = req.body.district;
        var ward = req.body.ward;
        var address = req.body.address;

        var sql = `insert into address(user_id, full_name, phone, city, district, ward, address, update_at, create_at) 
        values(${userId}, '${name}', ${phone}, '${city}', '${district}', '${ward}', '${address}', '${TimeNow()}', '${TimeNow()}')`;

        connection.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            res.send({type: 'OK', message: 'Create address success'});
               
        });
    });

};
