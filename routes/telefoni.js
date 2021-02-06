var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const path = require('path');
const fs = require('fs');

let conn = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'telefoni',
    port: 3306
});

router.get('/', function (req, res, next) {
    let query = `SELECT * FROM telefoni`;

    conn.query(query, (err, result) => {
        if (err) throw err;

        res.render('telefoni-index', {
            telefoni: result
        });
    });
});

router.get('/prikaz/:id', function (req, res, next) {
    let query = `SELECT * FROM telefoni WHERE id = ${req.params.id}`;

    conn.query(query, (err, result) => {
        if (err) throw err;

        res.render('telefoni-prikaz', {
            telefon: result[0]
        });
    });
});

router.get('/create', function (req, res, next) {
    if (req.session.ulogovan) {
        res.render('telefoni-create');
    }
    else {
        req.flash('redirect', 'Ne mozete pristupiti stranici ukoliko niste ulogovani.');
        res.redirect('/login');
    }
});

router.post('/', function (req, res, next) {
    if (req.session.ulogovan) {
        let imeSlike = '';
        let slika = null;
        if (req.files) {
            slika = req.files.slika;
            imeSlike = Date.now() + '_' + slika.name;
        }
        else {
            imeSlike = 'privremena.jpg';
        }
        let query = `INSERT INTO telefoni(marka, model, opis, cena, slika)
                         VALUES('${req.body.marka}', '${req.body.model}', '${req.body.opis}', '${req.body.cena}', '${imeSlike}')`;


        if (req.body.marka && req.body.model && req.body.opis && req.body.cena) {

            conn.query(query, (err, result) => {
                if (err) throw err;
                if (imeSlike !== 'privremena.jpg') {
                    slika.mv(path.join(__dirname, '../public/images/' + imeSlike), function (err) {
                        if (err) {
                            req.flash('poruka', 'Greska...')
                            return res.redirect(400, '/telefoni/admin');
                        }
                    });
                }
                req.flash('uspeh', 'Telefon uspesno dodat.');
                res.redirect('/telefoni/admin');
            });
        }
        else {
            req.flash('poruka', 'Niste uneli sva polja.');
            req.flash('marka', req.body.marka);
            req.flash('model', req.body.model);
            req.flash('opiis', req.body.opiis);
            req.flash('cena', req.body.cena);
            res.redirect('/telefoni/create');
        }
    }
    else {
        req.flash('redirect', 'Ne mozete pristupiti stranici ukoliko niste ulogovani.');
        res.redirect('/login');
    }
});

router.get('/edit/:id', function (req, res, next) {
    if (req.session.ulogovan) {
        let query = `SELECT * FROM telefoni WHERE id = ${req.params.id}`;

        conn.query(query, (err, result) => {
            if (err) throw err;

            if (result.length === 0) {
                req.flash('poruka', 'Doslo je do greske.')
                res.redirect('/telefoni/admin');
            }
            return res.render('telefoni-edit', {
                telefon: result[0]
            });
        });
    }
    else {
        req.flash('redirect', 'Ne mozete pristupiti stranici ukoliko niste ulogovani.');
        res.redirect('/login');
    }

});

router.post('/:id', function (req, res, next) {
    if (req.session.ulogovan) {
        let imeSlike = '';
        let slika = null;
        let query1 = `SELECT * FROM telefoni WHERE id = ${req.params.id}`

        if (req.body.marka && req.body.model && req.body.opis && req.body.cena) {
            conn.query(query1, (err, result) => {
                if (err) throw err;

                if (req.files) {
                    slika = req.files.slika;
                    imeSlike = Date.now() + '_' + slika.name;
                }
                else {
                    imeSlike = result[0].slika;
                }

                let query2 = `UPDATE telefoni SET 
                             marka = '${req.body.marka}', 
                             model = '${req.body.model}',
                             opis = '${req.body.opis}',
                             cena = '${req.body.cena}',
                             slika = '${imeSlike}'
                             WHERE id = ${req.params.id}`;
                conn.query(query2, (err, result1) => {
                    if (err) throw err;

                    if (imeSlike !== result[0].slika) {
                        if (result[0].slika !== 'privremena.jpg') {
                            fs.unlinkSync(path.join(__dirname, '../public/images/' + result[0].slika));
                        }
                        slika.mv(path.join(__dirname, '../public/images/' + imeSlike), function (err) {
                            if (err) {
                                req.flash('poruka', 'Greska...')
                                return res.redirect(400, '/telefoni/admin');
                            }
                        });
                    }
                    req.flash('uspeh', 'Telefon uspesno izmenjen.');
                    res.redirect('/telefoni/admin');
                });

            });
        }
        else {
            req.flash('poruka', 'Niste uneli sva polja.');
            req.flash('marka', req.body.marka);
            req.flash('model', req.body.model);
            req.flash('opiis', req.body.opiis);
            req.flash('cena', req.body.cena);
            res.redirect('/telefoni/edit/' + req.params.id);
        }
    }
    else {
        req.flash('redirect', 'Ne mozete pristupiti stranici ukoliko niste ulogovani.');
        res.redirect('/login');
    }
});

router.post('/delete/:id', function (req, res, next) {
    if (req.session.ulogovan) {
        let query1 = `DELETE FROM telefoni WHERE id = ${req.params.id}`;
        let query2 = `SELECT * FROM telefoni WHERE id = ${req.params.id}`;

        conn.query(query2, (err, result) => {
            if (err) throw err;

            if (result[0].slika !== 'privremena.jpg') {
                fs.unlinkSync(path.join(__dirname, '../public/images/' + result[0].slika))
            }

            conn.query(query1, (err, result1) => {
                if (err) throw err;

                req.flash('uspeh', `Uspesno ste uklonili telefon.`);
                res.redirect('/telefoni/admin');
            });
        });
    }
    else {
        req.flash('redirect', 'Ne mozete pristupiti stranici ukoliko niste ulogovani.');
        res.redirect('/login');
    }
});

router.get('/admin', function (req, res, next) {
    if (req.session.ulogovan) {
        let query = `SELECT * FROM telefoni`;

        conn.query(query, (err, result) => {
            if (err) throw err;

            res.render('telefoni-admin', {
                telefoni: result
            });
        });
    }
    else {
        req.flash('redirect', 'Ne mozete pristupiti stranici ukoliko niste ulogovani.');
        res.redirect('/login');
    }
});


module.exports = router;
