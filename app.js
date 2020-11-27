import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
let app = express();
let url = require('url');
let util = require('util');

let mysql = require('mysql');

let con = mysql.createConnection({
  host: "mysql.metropolia.fi",
  user: "onnilu",
  password: "tietoonnilukanta",
  database: "onnilu"
});


app.use(bodyParser.urlencoded({
  extended: false }));
app.use(bodyParser.json());


// parametrien kirjoitustapa selaimessa : http://localhost:8080/api/players?group=asd
app.get("/api/players", function (req, res) {
  console.log("Get players from a certain group");
  let q = url.parse(req.url, true).query;
  let group = q.group;
  let alteredResult;
  let string;

  let sql = "SELECT Pelaajat.nimi, Statistiikat.pelatutlkm, Statistiikat.voitotlkm"
      + " FROM Pelaajat, Statistiikat, Ryhmat"
      + " WHERE Pelaajat.ryhmaid = Ryhmat.ryhmaid and Ryhmat.nimi = ? and"
      + " Pelaajat.pelaajaid = Statistiikat.pelaajaid"
      + " ORDER BY Pelaajat.nimi";

  const query = util.promisify(con.query).bind(con);

  (async () => {
    try {
      const rows = await query(sql,[group]);
      string = JSON.stringify(rows);
      alteredResult = '{"numOfRows":'+rows.length+',"rows":'+string+'}';
      console.log(rows);
      res.send(alteredResult);


    }
    catch (err) {
      console.log("Database error!"+ err);
    }
    finally {
      //conn.end();
    }
  })()
});


// parametrien kirjoitustapa selaimessa : http://localhost:8080/api/login?group=asd&password=asd
app.get("/api/login", function (req, res) {
  console.log("Checks your group");
  let q = url.parse(req.url, true).query;
  let group = q.group;
  let password = q.password;
  let alteredResult;
  let string;

  let sql = "SELECT Ryhmat.nimi"
      + " FROM Ryhmat"
      + " WHERE Ryhmat.nimi = ? and Ryhmat.salasana = ?";

  const query = util.promisify(con.query).bind(con);

  (async () => {
    try {
      const rows = await query(sql,[group, password]);
      string = JSON.stringify(rows);
      alteredResult = '{"numOfRows":'+rows.length+',"rows":'+string+'}';
      console.log(rows);
      res.send(alteredResult);

    }
    catch (err) {
      console.log("Database error!"+ err);
    }
    finally {
      //conn.end();
    }
  })()
});

// parametrien kirjoitustapa selaimessa : http://localhost:8080/api/player?group=asd&player=Onni
app.get("/api/player", function (req, res) {
  console.log("Get stats of one player");
  let q = url.parse(req.url, true).query;
  let group = q.group;
  let player = q.player;
  let alteredResult;
  let string;

  let sql = "SELECT Pelaajat.nimi, Statistiikat.pelatutlkm, Statistiikat.voitotlkm,"
      + " Statistiikat.0p, Statistiikat.1p, Statistiikat.2p, Statistiikat.3p, Statistiikat.4p,"
      + " Statistiikat.5p, Statistiikat.6p, Statistiikat.7p, Statistiikat.8p, Statistiikat.9p,"
      + " Statistiikat.10p, Statistiikat.11p, Statistiikat.12p"
      + " FROM Pelaajat, Statistiikat, Ryhmat"
      + " WHERE Pelaajat.ryhmaid = Ryhmat.ryhmaid and Ryhmat.nimi = ? and"
      + " Pelaajat.pelaajaid = Statistiikat.pelaajaid and Pelaajat.nimi = ?";

  const query = util.promisify(con.query).bind(con);

  (async () => {
    try {
      const rows = await query(sql,[group, player]);
      string = JSON.stringify(rows);
      alteredResult = '{"numOfRows":'+rows.length+',"rows":'+string+'}';
      console.log(rows);
      res.send(alteredResult);


    }
    catch (err) {
      console.log("Database error!"+ err);
    }
    finally {
      //conn.end();
    }
  })()
});


// parametrien kirjoitustapa selaimessa : http://localhost:8080/api/games?group=asd
app.get("/api/games", function (req, res) {
  console.log("Get list of played games");
  let q = url.parse(req.url, true).query;
  let group = q.group;
  let alteredResult;
  let string;

  let sql = "SELECT Pelit.pvm, Pelaajat.nimi"
      + " FROM Pelit, Ryhmat, Pelaajat"
      + " WHERE Pelit.ryhmaid = Ryhmat.ryhmaid and Ryhmat.nimi = ?"
      + " and Pelaajat.pelaajaid = Pelit.voittajaid"
      + " ORDER BY Pelit.pvm";

  const query = util.promisify(con.query).bind(con);

  (async () => {
    try {
      const rows = await query(sql,[group]);
      string = JSON.stringify(rows);
      alteredResult = '{"numOfRows":'+rows.length+',"rows":'+string+'}';
      console.log(rows);
      res.send(alteredResult);


    }
    catch (err) {
      console.log("Database error!"+ err);
    }
    finally {
      //conn.end();
    }
  })()
});








let server = app.listen(8080, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port)
});