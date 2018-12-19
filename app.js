const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ATV0A1vPfEJYVdmZ-IT0pOunpPqdmQZFkGYDvSzqB-lREPG5LcVYAFQEiSIjTRyuLATp5RQgobL7S3Hi',
    'client_secret': 'EE-bcNHp7z8qITyAP7bNBKupbelej44GrAStnDfMpsi8aXnkqTUBFpR4lIdGvRoK7ox4uArtLC77QTmT'
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Red Sox Hat",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Hat for the best team ever"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });

});

app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3000, () => console.log('Server Started'));
//access token -access_token$sandbox$gx9zdgq9szsssw2x$00ac93850f57a4c2ae4498de5d68a1f6
const PORT = process.env.PORT || 4000;

app.listen(PORT, console.log(`server started on port ${PORT}`));


//client_id': 'ATV0A1vPfEJYVdmZ-IT0pOunpPqdmQZFkGYDvSzqB-lREPG5LcVYAFQEiSIjTRyuLATp5RQgobL7S3Hi',
//'client_secret': 'EE-bcNHp7z8qITyAP7bNBKupbelej44GrAStnDfMpsi8aXnkqTUBFpR4lIdGvRoK7ox4uArtLC77QTmT'