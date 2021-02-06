var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');

let conn = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'telefoni',
  port: 3306
});


router.get('/', function (req, res, next) {

  if (req.session.ulogovan) {
    let query = `SELECT * FROM users WHERE id = ${req.session.ulogovan.id}`;

    conn.query(query, (err, result) => {
      if (err) throw err;

      if (result.length === 0) {
        req.flash('poruka', 'Doslo je do greske.')
        res.redirect('/telefoni/admin');
      }
      return res.render('user-prikaz', {
        user: result[0]
      });
    });
  }
  else {
    req.flash('redirect', 'Ne mozete pristupiti stranici ukoliko niste ulogovani.');
    res.redirect('/login');
  }

});

router.get('/edit', function (req, res, next) {
  if (req.session.ulogovan) {
    let query = `SELECT * FROM users WHERE id = ${req.session.ulogovan.id}`;

    conn.query(query, (err, result) => {
      if (err) throw err;

      if (result.length === 0) {
        req.flash('poruka', 'Doslo je do greske.')
        res.redirect('/users/');
      }
      return res.render('user-edit', {
        user: result[0]
      });
    });
  }
  else {
    req.flash('redirect', 'Ne mozete pristupiti stranici ukoliko niste ulogovani.');
    res.redirect('/login');
  }
});

router.post('/', function (req, res, next) {
  if (req.session.ulogovan) {
    let query1 = `SELECT * FROM users WHERE id = ${req.session.ulogovan.id}`;
    let query2 = `UPDATE users SET 
                  ime = '${req.body.ime}', 
                  telefon = '${req.body.telefon}', 
                  email = '${req.body.email}'
                  WHERE id = ${req.session.ulogovan.id}`;
    if (req.body.ime && req.body.telefon && req.body.email) {
      conn.query(query1, (err, result) => {
        if (err) throw err;
        if (result.length != 0) {
          if (bcrypt.compareSync(req.body.password, result[0].lozinka)) {
            conn.query(query2, (err, result1) => {
              if (err) throw err;
              req.session.ulogovan = {
                id: result[0].id,
                ime: result[0].ime,
                email: result[0].email,
              }
              res.locals.ulogovan = {
                id: result[0].id,
                ime: result[0].ime,
                email: result[0].email,
              }

              req.flash('uspeh', 'Uspesno ste izmeni vase podatke.');
              res.redirect('/users/');
            });

          }
          else {
            req.flash('poruka', 'Pogresna lozinka.');
            req.flash('ime', req.body.ime);
            req.flash('telefon', req.body.telefon);
            req.flash('email', req.body.email)
            res.redirect('/users/edit');
          }
        }
        else {
          req.flash('poruka', 'Doslo je do greske.');
          res.redirect('/users/');
        }
      })
    }
    else {
      req.flash('poruka', 'Niste uneli sva polja.');
      req.flash('ime', req.body.ime);
      req.flash('telefon', req.body.telefon);
      req.flash('email', req.body.email);
      res.redirect('/users/edit');
    }
  }
  else {
    req.flash('redirect', 'Ne mozete pristupiti stranici ukoliko niste ulogovani.');
    res.redirect('/login');
  }

});

module.exports = router;
