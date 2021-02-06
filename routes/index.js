var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const mysql = require('mysql');

let conn = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'telefoni',
  port: 3306
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/login', function (req, res, next) {
  let email = req.body.email;
  let pass = req.body.password;

  let query = `SELECT * FROM users WHERE email LIKE '${email}'`;
  conn.query(query, (err, result) => {
    if (err) throw err;
    if (result.length != 0) {
      if (bcrypt.compareSync(pass, result[0].lozinka)) {
        res.locals.ulogovan = result[0];
        req.session.ulogovan = {
          id: result[0].id,
          ime: result[0].ime,
          email: result[0].email,
        }
        req.flash('poruka', 'Uspesno ste se ulogovali.');
        res.redirect('/');
      }
      else {
        req.flash('poruka', 'Pogresna lozinka.');
        req.flash('email', req.body.email);
        res.redirect('/login');
      }
    }
    else {
      req.flash('poruka', 'Ne postoji korisnik sa unetim e-mailom.');
      res.redirect('/login');
    }
  })
});

router.post('/register', function (req, res, next) {
  if (req.body.password === req.body.passwordConfirm) {
    let query = `INSERT INTO users(ime, telefon, email, lozinka) VALUES('${req.body.ime}', '${req.body.telefon}', '${req.body.email}', '${bcrypt.hashSync(req.body.password, 10)}')`;
    conn.query(query, (err, result) => {
      if (err) throw err;
      req.flash('obavestenje', 'Vas nalog je kreiran. Ulogujte se da biste nastavili.');
      res.redirect('/login');
    });
  }
  else {
    req.flash('poruka', 'Vase lozinke se ne poklapaju.');
    req.flash('ime', req.body.ime);
    req.flash('telefon', req.body.telefon);
    req.flash('email', req.body.email);
    res.redirect('/register');
  }
});

router.get('/logout', function (req, res, next) {
  delete req.session['ulogovan'];
  res.redirect('/login');
});

router.post('/logout', function (req, res, next) {
  delete req.session['ulogovan'];
  res.redirect('/login');
});


module.exports = router;
