const bodyParser = require("body-parser");
const urlencodeParser = bodyParser.urlencoded({ extended: false });
require('dotenv').config()
const paypal = require('paypal-rest-sdk');

module.exports = function (app) {
paypal.configure({
    // Email:
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.CLIENT_ID,
  'client_secret':process.env.CLIENT_SECRET,
});
app.post('/pay',urlencodeParser, (req, res) => {
  console.log("req.body",req.body);
  let productList1 = req.body.productList; 
  console.log(productList1);
  // let dataUser = req.body.data;
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": `${process.env.HOST_NAME}:${process.env.HOST_PORT}/success`,
        "cancel_url": `${process.env.HOST_NAME}:${process.env.HOST_PORT}/cancel`
    },
    "transactions": [{
        "item_list":{
           "items": productList1
        },
        "amount": {
            "currency": "USD",
            "total": "30.11"
        },
        "description":"The payment transaction description."
    }]
};

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  // console.log(payerId);
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total":"30.11"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        // console.log(JSON.stringify(payment));
        res.send('Success');
    }
});
});

  paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          throw error;
      } else {
          for(let i = 0;i < payment.links.length;i++){
            if(payment.links[i].rel === 'approval_url'){
              res.redirect(payment.links[i].href);
            }
          }
      }
    });
    
    });

app.get('/cancel', (req, res) => {
  console.log('cancelling');
  res.send('Cancelled')
});
}
