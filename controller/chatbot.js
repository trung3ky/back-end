var bodyParser = require("body-parser");
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
const { PythonShell } = require("python-shell");
var connection = require("./db");
const uuid = require("uuid");
var TimeNow = require("./atom");
const fastcsv = require("fast-csv");
const fs = require("fs");
module.exports = function (app) {
  app.get("/chatbot/:content", urlencodeParser, function (req, res) {
    // handleWriteFileProduct();
    const content = req.params["content"];
    PythonShell.run("python_chatbot\\chat.py", { args: [content] }, (err, ressult) => {
      if (err) console.log(err);
      if (ressult) {
        console.log(ressult)
        res.json(ressult.join(',  '));
      }
    });
  });
};
