var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
// SDK de Mercado Pago
const mercadopago = require('mercadopago');
var app = express();
dotenv.config();

// Agrega credenciales
mercadopago.configure({
    integrator_id: process.env.INTEGRATOR_ID,
    access_token: process.env.ACCESS_TOKEN
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// Configurar cabeceras y cors
app.use('/assets', express.static('assets'))

// parse application/json
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/failure', function (req, res) {

    res.render('failure');
});
app.get('/pending', function (req, res) {

    res.render('pending');
});
app.get('/success', function (req, res) {
     
    res.render('success');
});

app.post('/payment-process', function (req, res) {


    //se crea una url de las imagenes.
    var image_url = req.protocol + '://' + req.get('host') +req.body.img.substring(1);

    var itemCreado = { 
        id: "1234",
        title: req.body.title,
        unit_price: parseFloat(req.body.price),
        description: "Dispositivo móvil de Tienda e-commerce",
        picture_url: image_url,
        quantity:1,
    };

    var payer = {
        name: "Lalo",
        surname: "Landa",
        email: "test_user_63274575@testuser.com",
        phone: {
          area_code: "11",
          number: 22223333
        },
         
        address: {
          street_name: "False",
          street_number: 123,
          zip_code: "1111"
        }
    };

    let preference = {
        items: [
            itemCreado
        ],
        payer: payer,
        external_reference: 'matidigi99@gmail.com',
        payment_methods: { 
            excluded_payment_methods: [{ id: 'amex' }],
            excluded_payment_types:[{ id: 'atm' }],
            installments: 6 ,
        },
        notification_url: req.protocol + '://' + req.get('host') + '/notifications',
        back_urls:{
            success:req.protocol + '://' + req.get('host') + '/success',
            pending:req.protocol + '://' + req.get('host') + '/pending',
            failure:req.protocol + '://' + req.get('host') + '/failure'
        },
        auto_return:"approved"

    };
    mercadopago.preferences.create(preference).then((response) => {
        console.log(preference);
        console.log("id del preference : ",response.body.id)
        res.render('detail', {id:response.body.init_point, price:req.body.price, title:req.body.title, img:req.body.img});
    }).catch((error) => {
        console.log(error)
        res.status(500).send(error);
    });

});

app.post('/notifications', (req,res)=>{


  //  https://www.tusitio.com/success.php?collection_id=[PAYMENT_ID]&collection_status=approved&
  //external_reference=[EXTERNAL_REFERENCE]&payment_type=credit_card&preference_id=[PREFERENCE_ID]&
  //site_id=[SITE_ID]&processing_mode=aggregator&merchant_account_id=null


    console.log("respuesta notificacion ", req);

    var payment_method_id =req.body.payment_type;
    var external_reference= req.body.external_reference;
    var collection_id=req.body.collection_id;

    var topic =req.body.topic;
    var id= req.body.id;
    console.log("id : ",id);
    res.status(200).send('OK');

    res.render('notifications', { payment_method_id: payment_method_id,external_reference:external_reference, co:collection_idllection_id});
})

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.listen(process.env.PORT || 3000);