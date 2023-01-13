const bodyParser = require("body-parser");
const connection = require("./db");
const mysql = require('mysql');
const urlencodeParser = bodyParser.urlencoded({ extended: false });
require('dotenv').config()
const paypal = require('paypal-rest-sdk');
const moment = require('moment');
const nodemailer = require("nodemailer");
const TimeNow = require('./atom');
const pug = require('pug');
const fs = require('fs');
const { QueryTypes } = require('sequelize');
const sequelize = require('../controller/db2');



module.exports = function (app) {
  paypal.configure({
    // Email:
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET,
  });
  app.post('/pay', urlencodeParser, async (req, res) => {
    let { userId, totalShip, newTotalPrice, listId, address } = req.body;
    let fullAdress = `${address.address} - ${address.ward_name} - ${address.district_name} - ${address.city_name}`;
    let dataId = []
    let email, nameUser;
    listId.map(item => dataId.push(item));
    const result = await sequelize.query(`select quanlity,product_new.id,product_new.product_image,product_new.product_name,product_new.product_price,users.name,users.email, cart.id as cartId from cart JOIN product_new ON cart.product_id = product_new.id INNER JOIN users ON users.id = cart.user_id WHERE user_id = "${userId}" AND product_id IN(:dataId)`,
      {
        replacements: { dataId: dataId },
        type: QueryTypes.SELECT
      })

    // const sql = mysql.format(`select quanlity,product_new.product_image,product_new.product_name,product_new.product_price,users.name,users.email from cart JOIN product_new ON cart.product_id = product_new.id INNER JOIN users ON users.id = cart.user_id where user_id = "${userId}" AND product_id IN (?)`, [dataId]);
    // connection.query(sql, function (err, result) {
    //   if (err) throw err;
    email = result[0].email
    nameUser = result[0].name
    let cartId = result.map(item => item.cartId);
    const newR = result.map(item => {
      let { product_name, product_price, quanlity, name, email, id } = item;
      return {
        "name": `${product_name}`,
        "sku": `${id}`,
        "price": Number(product_price),
        "currency": "USD",
        "quantity": Number(quanlity)
      }
    });

    const create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal",
        "payer_info": {
          "shipping_address": {
            "recipient_name": "Tien Nguyen",
            "line1": "1 Main St",
            "city": "San Jose",
            "state": "CA",
            "postal_code": "95131",
            "country_code": "US"
          },
          "country_code": "US"
        }
      },
      "redirect_urls": {
        "return_url": `http://localhost:8000/success/userId/${userId}/totalShip/${totalShip}/totalPrice/${newTotalPrice}/email/${email}/nameUser/${nameUser.replace(/\s+/g, '')}/fullAdress/${encodeURI(fullAdress)}/cartId/${encodeURI(JSON.stringify(cartId))}`,
        "cancel_url": "http://localhost:8000/cancel"
      },
      "transactions": [{
        "item_list": {
          "items": newR,
        }
        ,
        "amount": {
          "total": Number(Number(totalShip) + Number(newTotalPrice)).toFixed(2),
          "currency": "USD",
          "details": {
            "subtotal": Number(newTotalPrice),
            "tax": "0.00",
            "shipping": Number(totalShip)
          }
        },
        "description": `"Hat for the best team ever ${totalShip}"`,
      }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
      console.log("create payment", create_payment_json.transactions[0].item_list)
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            // res.redirect(payment.links[i].href);
            res.json({ forwardLink: payment.links[i].href });
          }
        }
      }
    });


  })
  app.get('/success/userId/:userId/totalShip/:totalShip/totalPrice/:totalPrice/email/:email/nameUser/:nameUser/fullAdress/:fullAdress/cartId/:cartId', (req, res) => {
    const userId = req.params["userId"];
    const totalShip = req.params["totalShip"];
    const totalPrice = req.params["totalPrice"];
    const email = req.params["email"];
    const nameUser = req.params["nameUser"];
    const fullAdress = req.params["fullAdress"];
    const cartId = JSON.parse(req.params["cartId"]);
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;


    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
        "amount": {
          "currency": "USD",
          "total": Number(Number(totalShip) + Number(totalPrice)).toFixed(2),
        }
      }]
    };
    console.log(execute_payment_json)
    function HanddleError(err) {
      console.log(err);
    }
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      try {
        var sql = `select id from cart where user_id = ${userId}`;
        connection.query(sql, function (err, result) {
          if (err) throw err;
          if (result.length > 0) {
            // payment_method 0: thanh toán qua paypal, 1: thanh toán khác
            // status_order: 0: chờ xác nhận, 1: vận chuyển :
            var sqlOrder = `INSERT INTO orders(user_id,payment_method,status_order,totalPrice,totalShip,shipping_address, create_at,update_at) VALUES (${userId},0,0,${payment.transactions[0].amount.details.subtotal},${payment.transactions[0].amount.details.shipping},'${fullAdress}','${TimeNow()}','${TimeNow()}')`;
            connection.query(sqlOrder, function (err, result) {
              if (err) throw err;
              payment.transactions[0].item_list.items.map(item => {
                var sqlProductOrder = `INSERT INTO product_order(order_id,product_id,quanlity,price,created_at, updated_at) VALUES (${result.insertId},${item.sku},${item.quantity},${item.price},'${TimeNow()}','${TimeNow()}')`;
                connection.query(sqlProductOrder, async function (err, result) {
                  if (err) throw err;
                  const product = await sequelize.query(`select * from product_new where id = ${item.sku}`)
                  const newQuanlity = product[0][0].product_quanlity - Number(item.quantity)
                  await sequelize.query(`UPDATE product_new
                          SET product_quanlity = ${newQuanlity},
                          updated_at = '${TimeNow()}'
                          WHERE id = '${item.sku}'`);
                  console.log("insert successfully")
                })

              })
              const sql = mysql.format(`DELETE FROM cart WHERE id IN (?)`, [cartId]);
              connection.query(sql, function (err, result) {
                if (err) throw err;
              })
              // console.log("result.insertId", result.insertId);
              payment.create_time = moment(payment.create_time).format('MMMM do YYYY h:mm:ss a')
              payment.update_time = moment(payment.update_time).format('MMMM do YYYY h:mm:ss a')
              payment.email = email;
              payment.userId = userId;
              payment.nameUser = nameUser;
              res.render('index', { data: payment })
              sendMail(payment);
            })
          }
        })
      } catch (error) {
        console.log("có lỗi ")
        HanddleError(error)
      }
    });
  });






  app.get('/cancel', (req, res) => {
    console.log('cancelling');
    res.redirect("http://localhost:3005/cart")
  });
  function sendMail(data) {
    console.log("data", data)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: "nvantien222@gmail.com", // generated ethereal user
        pass: "k j i c t g l j e u b p d i z k", // get from app password google
      },
    });

    // send mail with defined transport object   
    let mailOptions = {
      from: "nvantien222@gmail.com", // sender address
      to: data.email, // list of receivers
      subject: `Invoice from Bill Of Supply VENAM. Retailers to ${data.nameUser}`, // Subject line 
      html: pug.renderFile('views/index.pug', { data }), // html body
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent:');
      }
    });
  }
}
