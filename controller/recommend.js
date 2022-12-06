var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require('./db');
var TimeNow = require('./atom');
const { spawn } = require('child_process')
const { PythonShell } = require('python-shell')

// let option = {
//     // scriptPath: 'E:/pyshell',
//     args: ['trung', 22]
// }

module.exports = function(app) {
    app.get('/recommend/:user_id', function(req, res, next) {
        const userId = req.params['user_id']
        console.log(userId)
        PythonShell.run('python\\recommend.py', { args: [userId]}, (err, res) => {
            if(err) console.log(err)
            if(res) console.log(res)
        })
        // const max_results = req.query.max_results ?? 25;
        // var sql = `select * from ratings limit ${max_results}`;
        
        // connection.query(sql, function(err, result) {
        //     if (err) {
        //         throw err;
        //     }
        //     res.send(result);
        // })
    })
}