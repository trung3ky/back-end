var bodyParser = require('body-parser');
var urlencodeParser = bodyParser.urlencoded({ extended: false });
var parserJson = bodyParser.json();
var connection = require('./db');
var TimeNow = require('./atom');
const uuid = require('uuid');

module.exports = function(app) {
    app.get('/product', function(req, res, next) {
        const max_results = req.query.max_results ?? 25;
        var sql = `select * from products where deleted = 0 limit ${max_results}`;
        
        connection.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            res.send(result);
        })
    })
    
    app.get('/product/:product_id', function(req, res) {
        const productId = req.params['product_id']
        var sql = "select * from products where id = '" + productId + "' and deleted = 0";
        connection.query(sql, function(err, result) {
            if (err) {
                throw err;
            }
            if(result.length > 0){
                res.send(...result);
            }else {
                res.send({message: 'not found'})
            }
        });
    })

    app.post('/product/create_product', urlencodeParser, function(req, res) {
        const name = req.body.name ?? null;
        const category_id = req.body.category_id ?? null;
        const shop_id = req.body.shop_id ?? null;
        const image = req.body.image ?? null;
        const description = req.body.description ?? null;
        const quanlity = req.body.quanlity ?? null;
        const price = req.body.price ?? null;
        const sale = req.body.sale ?? null;

        var sql = `insert into products(id, brand, slug, id_shop, id_category, name, image, description, quanlity, price, sale, rating, others, deleted, created_at, updated_at) 
        values('${uuid.v4()}', null, null, ${shop_id}, ${category_id}, '${name}', '${image}', '${description}', ${quanlity}, ${price}, ${sale}, null, null, 0, '${TimeNow()}', '${TimeNow()}')`;

        connection.query(sql, function(err, result) {
            if (err) {
                res.json({type: 'Create error', message: err.message})
            }else {
                res.json({type: 'Create success'})
            }
        });
    })

    app.post('/product/delete_product/:product_id', urlencodeParser, function(req, res) {
        const productId = req.params['product_id']
        var sql = `UPDATE products
        SET deleted = 1
        WHERE id = '${productId}'`;

        connection.query(sql, function(err, result) {
            if (err) {
                res.json({type: 'Delete error', message: err.message})
            }else {
                res.json({type: 'Delete success'})
            }
        });
    })

    app.post('/product/update_product/:product_id', urlencodeParser, function(req, res) {
        const productId = req.params['product_id']

        const name = req.body?.name ?? null;
        const category_id = req.body?.category_id ?? null;
        const image = req.body?.image ?? null;
        const description = req.body?.description ?? null;
        const quanlity = req.body?.quanlity ?? null;
        const price = req.body?.price ?? null;
        const sale = req.body?.sale ?? null;
        
        var sql = `UPDATE products
        SET name =' ${name}',
        category_id = ${category_id},
        image =' ${image}',
        description = '${description}',
        quanlity = ${quanlity},
        price = ${price},
        sale = ${sale},
        updated_at = '${TimeNow()}'
        WHERE id = '${productId}'`;

        connection.query(sql, function(err, result) {
            if (err) {
                res.json({type: 'Update error', message: err.message})
            }else {
                res.json({type: 'Update success'})
            }
        });
    })


}


