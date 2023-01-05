var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: '',
  database: 'ecommerce',
  insecureAuth: true
});
connection.on('error', function (err) {
  console.log("[mysql error]", err);
});
connection.connect(function (err) {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('connected! ');
});
module.exports = connection;
