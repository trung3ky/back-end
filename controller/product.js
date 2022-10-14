var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require('./db');
const uuid = require('uuid');

module.exports = function(app) {
    app.get('/product', function(req, res, next) {
        const max_results = req.query.max_results ?? 25;
        var sql = `select * from products limit ${max_results}`;
        
        connection.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.send(result);
        })
    })
    
    app.get('/product/:product_id', function(req, res) {
        const productId = req.params['product_id']
        var sql = "select * from products where id = '" + productId + "' ";
        connection.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.send(...result);
        });
    })

    app.post('/product/create_product', urlencodeParser, function(req, res) {
        console.log("🚀 ~ file: product.js ~ line 32 ~ app.post ~ req", req.body)
        const name = req.body.name ?? null;
        console.log("🚀 ~ file: product.js ~ line 33 ~ app.post ~ req.body.name", req.body.name)
        const category_id = req.body.category_id ?? null;
        const shop_id = req.body.shop_id ?? null;
        const image = req.body.image ?? null;
        const description = req.body.description ?? null;
        const quanlity = req.body.quanlity ?? null;
        const price = req.body.price ?? null;
        const sale = req.body.sale ?? null;

        var sql = `insert into products(id, brand, slug, id_shop, id_category, name, image, description, quanlity, price, sale, rating, others) 
        values('${uuid.v4()}', ${null}, ${null}, ${shop_id}, ${category_id}, '${name}', '${image}', '${description}', ${quanlity}, ${price}, ${sale}, ${null}, ${null})`;

        connection.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.send(...result);
        });
    })
}
