var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
// SDK de Mercado Pago
const mercadopago = require('mercadopago');
var app = express();
dotenv.config();

/*

Tarjeta	Número	CVV	Fecha de vencimiento
Mastercard	5031 7557 3453 0604	123	11/25
Visa	4170 0688 1010 8020	123	11/25
American Express	3711 8030 3257 522	1234	11/25


APRO: Pago aprobado.
CONT: Pago pendiente.
OTHE: Rechazado por error general.
CALL: Rechazado con validación para autorizar.
FUND: Rechazado por monto insuficiente.
SECU: Rechazado por código de seguridad inválido.
EXPI: Rechazado por problema con la fecha de expiración.
FORM: Rechazado por error en formulario




*/
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


app.post('/notifications', (req,res)=>{


    //  https://www.tusitio.com/success.php?collection_id=[PAYMENT_ID]&collection_status=approved&
    //external_reference=[EXTERNAL_REFERENCE]&payment_type=credit_card&preference_id=[PREFERENCE_ID]&
    //site_id=[SITE_ID]&processing_mode=aggregator&merchant_account_id=null
  
      console.log("respuesta notificacion ", req.body);

      var topic =req.body.topic;
      var id= req.body.id;
      console.log("id : ",id);
      res.status(200).send('OK');
  
      res.render('notifications', );
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
        notification_url: 'https://matudigi-mp-commerce-nodejs.herokuapp.com/notifications',
        back_urls:{
            success:'https://matudigi-mp-commerce-nodejs.herokuapp.com/success',
            pending:'https://matudigi-mp-commerce-nodejs.herokuapp.com/pending',
            failure:'https://matudigi-mp-commerce-nodejs.herokuapp.com/failure'
        },
        auto_return:"approved"

    };
    mercadopago.preferences.create(preference).then((response) => {
        console.log(response);
        console.log("id del preference : ",response.body.id)
        res.render('detail', {id:response.body.id, price:req.body.price, title:req.body.title, img:req.body.img});
    }).catch((error) => {
        console.log(error)
        res.status(500).send(error);
    });

});



app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.listen(process.env.PORT || 3000);