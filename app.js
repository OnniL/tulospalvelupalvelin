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

// parametrien kirjoitustapa selaimessa : http://localhost:8080/api/player?group=asd2&player=Onni
app.get("/api/player", function (req, res) {
  console.log("Get stats of one player");
  let q = url.parse(req.url, true).query;
  let group = q.group;
  let player = q.player;
  let alteredResult;
  let string;

  let sql = "SELECT Pelaajat.nimi, Statistiikat.pelatutlkm, Statistiikat.voitotlkm,"
      + " Statistiikat.p, Statistiikat.1p, Statistiikat.2p, Statistiikat.3p, Statistiikat.4p,"
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

// parametrien kirjoitustapa selaimessa : http://localhost:8080/api/newgroup
app.post('/api/newgroup', function (req, res) {
  console.log("Got a POST request for the homepage");
  const query = util.promisify(con.query).bind(con);
  let jsonOBJ = req.body;
  console.log(jsonOBJ);
  let sqlquery = "SELECT nimi FROM Ryhmat";
  (async () => {
    try {
      const rows = await query(sqlquery);
      console.log(rows);
      let equals = false;
      for(let i = 0; i < rows.length; i++){
        if(jsonOBJ.nimi === rows[i].nimi){
          equals = true;
        }
      }
      if (equals === false){
        sqlquery = "INSERT INTO Ryhmat (nimi, salasana) VALUES (?, ?)"
        await query(sqlquery,[jsonOBJ.nimi, jsonOBJ.salasana]);
        res.send("Post successful" + req.body);
      }
      else{
        res.send("Ryhmän nimi on jo käytössä")
      }
    }
    catch (err) {
      console.log("Database error!"+ err);
    }
    finally {
      //conn.end();
    }
  })()
});

// parametrien kirjoitustapa selaimessa : http://localhost:8080/api/newplayer
app.post('/api/newplayer', function (req, res) {
  console.log("Create a new player");
  const query = util.promisify(con.query).bind(con);
  let jsonOBJ = req.body;
  console.log(jsonOBJ);
  let ryhmaid;
  let sqlquery = "SELECT ryhmaid FROM Ryhmat WHERE nimi = ?";
  (async () => {
    try {
      ryhmaid = await query(sqlquery,[jsonOBJ.ryhman_nimi]);
      sqlquery = "SELECT nimi FROM Pelaajat WHERE ryhmaid = ?";
      const rows = await query(sqlquery,[ryhmaid[0].ryhmaid]);
      console.log(ryhmaid);
      console.log(rows);
      let equals = false;
      for(let i = 0; i < rows.length; i++){
        if(jsonOBJ.pelaajan_nimi === rows[i].nimi){
          equals = true;
        }
      }
      if (equals === false){
        sqlquery = "INSERT INTO Pelaajat (nimi, ryhmaid) VALUES (?, ?)";
        await query(sqlquery,[jsonOBJ.pelaajan_nimi, ryhmaid[0].ryhmaid]);
        sqlquery = "INSERT INTO Statistiikat (voitotlkm) VALUES (0)";
        res.send("Post successful" + req.body);
      }
      else{
        res.send("Saman niminen pelaaja on jo lisätty");
      }
    }
    catch (err) {
      console.log("Database error! "+ err);
    }
    finally {
      //conn.end();
    }
  })()
});

// parametrien kirjoitustapa selaimessa : http://localhost:8080/api/newgame
app.post('/api/newgame', function (req, res) {
  console.log("Got a POST request for the homepage");
  const query = util.promisify(con.query).bind(con);
  let jsonOBJ = req.body;
  console.log(jsonOBJ);
  let ryhmaid;
  let voittajaid;
  let pelaajaid;
  let sqlquery = "SELECT ryhmaid FROM Ryhmat WHERE nimi = ?";
  (async () => {
    try {
      ryhmaid = await query(sqlquery,[jsonOBJ.ryhman_nimi]);

      sqlquery = "SELECT pelaajaid FROM Pelaajat WHERE nimi = ? and ryhmaid = ?";
      voittajaid = await query(sqlquery,[jsonOBJ.voittajan_nimi, ryhmaid[0].ryhmaid]);

      sqlquery = "INSERT INTO Pelit (ryhmaid, voittajaid, pvm) VALUES (?, ?, ?)";
      await query(sqlquery,[ryhmaid[0].ryhmaid, voittajaid[0].pelaajaid, jsonOBJ.pvm]);
      res.send("Post successful" + req.body);

      let sqlqueryVoitto = "UPDATE Statistiikat SET pelatutlkm = pelatutlkm + 1, "
          + "voitotlkm = voitotlkm + 1, p = p + ?, 1p = 1p + ?, "
          + "2p = 2p + ?, 3p = 3p + ?, 4p = 4p + ?, 5p = 5p + ?, "
          + "6p = 6p + ?, 7p = 7p + ?, 8p = 8p + ?, 9p = 9p + ?,"
          + " 10p = 10p + ?, 11p = 11p + ?, 12p = 12p + ? "
          + "WHERE pelaajaid = ?";

      let sqlqueryHavio = "UPDATE Statistiikat SET pelatutlkm = pelatutlkm + 1, "
          + "p = p + ?, 1p = 1p + ?, "
          + "2p = 2p + ?, 3p = 3p + ?, 4p = 4p + ?, 5p = 5p + ?, "
          + "6p = 6p + ?, 7p = 7p + ?, 8p = 8p + ?, 9p = 9p + ?,"
          + " 10p = 10p + ?, 11p = 11p + ?, 12p = 12p + ? "
          + "WHERE pelaajaid = ?";



      if(jsonOBJ.pelaaja1.nimi !== ""){
        sqlquery = "SELECT pelaajaid FROM Pelaajat WHERE nimi = ? and ryhmaid = ?";
        pelaajaid = await query(sqlquery,[jsonOBJ.pelaaja1.nimi, ryhmaid[0].ryhmaid]);
        if(voittajaid[0].pelaajaid === pelaajaid[0].pelaajaid){
        console.log("p1voitto");
          await query(sqlqueryVoitto,[jsonOBJ.pelaaja1.p0, jsonOBJ.pelaaja1.p1, jsonOBJ.pelaaja1.p2
            , jsonOBJ.pelaaja1.p3, jsonOBJ.pelaaja1.p4, jsonOBJ.pelaaja1.p5, jsonOBJ.pelaaja1.p6
            , jsonOBJ.pelaaja1.p7, jsonOBJ.pelaaja1.p8, jsonOBJ.pelaaja1.p9, jsonOBJ.pelaaja1.p10
            , jsonOBJ.pelaaja1.p11, jsonOBJ.pelaaja1.p12, pelaajaid[0].pelaajaid])
        }else{
          console.log("p1häviö");
          await query(sqlqueryHavio,[jsonOBJ.pelaaja1.p0, jsonOBJ.pelaaja1.p1, jsonOBJ.pelaaja1.p2
            , jsonOBJ.pelaaja1.p3, jsonOBJ.pelaaja1.p4, jsonOBJ.pelaaja1.p5, jsonOBJ.pelaaja1.p6
            , jsonOBJ.pelaaja1.p7, jsonOBJ.pelaaja1.p8, jsonOBJ.pelaaja1.p9, jsonOBJ.pelaaja1.p10
            , jsonOBJ.pelaaja1.p11, jsonOBJ.pelaaja1.p12, pelaajaid[0].pelaajaid])
        }


      }

      if(jsonOBJ.pelaaja2.nimi !== ""){
        sqlquery = "SELECT pelaajaid FROM Pelaajat WHERE nimi = ? and ryhmaid = ?";
        pelaajaid = await query(sqlquery,[jsonOBJ.pelaaja2.nimi, ryhmaid[0].ryhmaid]);
        if(voittajaid[0].pelaajaid === pelaajaid[0].pelaajaid){

          await query(sqlqueryVoitto,[jsonOBJ.pelaaja2.p0, jsonOBJ.pelaaja2.p1, jsonOBJ.pelaaja2.p2
            , jsonOBJ.pelaaja2.p3, jsonOBJ.pelaaja2.p4, jsonOBJ.pelaaja2.p5, jsonOBJ.pelaaja2.p6
            , jsonOBJ.pelaaja2.p7, jsonOBJ.pelaaja2.p8, jsonOBJ.pelaaja2.p9, jsonOBJ.pelaaja2.p10
            , jsonOBJ.pelaaja2.p11, jsonOBJ.pelaaja2.p12, pelaajaid[0].pelaajaid])
        }else{

          await query(sqlqueryHavio,[jsonOBJ.pelaaja2.p0, jsonOBJ.pelaaja2.p1, jsonOBJ.pelaaja2.p2
            , jsonOBJ.pelaaja2.p3, jsonOBJ.pelaaja2.p4, jsonOBJ.pelaaja2.p5, jsonOBJ.pelaaja2.p6
            , jsonOBJ.pelaaja2.p7, jsonOBJ.pelaaja2.p8, jsonOBJ.pelaaja2.p9, jsonOBJ.pelaaja2.p10
            , jsonOBJ.pelaaja2.p11, jsonOBJ.pelaaja2.p12, pelaajaid[0].pelaajaid])

        }

      }


      if(jsonOBJ.pelaaja3.nimi !== ""){
        sqlquery = "SELECT pelaajaid FROM Pelaajat WHERE nimi = ? and ryhmaid = ?";
        pelaajaid = await query(sqlquery,[jsonOBJ.pelaaja3.nimi, ryhmaid[0].ryhmaid]);

        if(voittajaid[0].pelaajaid === pelaajaid[0].pelaajaid){

          await query(sqlqueryVoitto,[jsonOBJ.pelaaja1.p0, jsonOBJ.pelaaja1.p1, jsonOBJ.pelaaja1.p2
            , jsonOBJ.pelaaja3.p3, jsonOBJ.pelaaja3.p4, jsonOBJ.pelaaja3.p5, jsonOBJ.pelaaja3.p6
            , jsonOBJ.pelaaja3.p7, jsonOBJ.pelaaja3.p8, jsonOBJ.pelaaja3.p9, jsonOBJ.pelaaja3.p10
            , jsonOBJ.pelaaja3.p11, jsonOBJ.pelaaja3.p12, pelaajaid[0].pelaajaid])
        }else{

          await query(sqlqueryHavio,[jsonOBJ.pelaaja3.p0, jsonOBJ.pelaaja3.p1, jsonOBJ.pelaaja3.p2
            , jsonOBJ.pelaaja3.p3, jsonOBJ.pelaaja3.p4, jsonOBJ.pelaaja3.p5, jsonOBJ.pelaaja3.p6
            , jsonOBJ.pelaaja3.p7, jsonOBJ.pelaaja3.p8, jsonOBJ.pelaaja3.p9, jsonOBJ.pelaaja3.p10
            , jsonOBJ.pelaaja3.p11, jsonOBJ.pelaaja3.p12, pelaajaid[0].pelaajaid])
        }

      }

      if(jsonOBJ.pelaaja4.nimi !== ""){
        sqlquery = "SELECT pelaajaid FROM Pelaajat WHERE nimi = ? and ryhmaid = ?";
        pelaajaid = await query(sqlquery,[jsonOBJ.pelaaja4.nimi, ryhmaid[0].ryhmaid]);

        if(voittajaid[0].pelaajaid === pelaajaid[0].pelaajaid){

          await query(sqlqueryVoitto,[jsonOBJ.pelaaja4.p0, jsonOBJ.pelaaja4.p1, jsonOBJ.pelaaja4.p2
            , jsonOBJ.pelaaja4.p3, jsonOBJ.pelaaja4.p4, jsonOBJ.pelaaja4.p5, jsonOBJ.pelaaja4.p6
            , jsonOBJ.pelaaja4.p7, jsonOBJ.pelaaja4.p8, jsonOBJ.pelaaja4.p9, jsonOBJ.pelaaja4.p10
            , jsonOBJ.pelaaja4.p11, jsonOBJ.pelaaja4.p12, pelaajaid[0].pelaajaid])
        }else{

          await query(sqlqueryHavio,[jsonOBJ.pelaaja4.p0, jsonOBJ.pelaaja4.p1, jsonOBJ.pelaaja4.p2
            , jsonOBJ.pelaaja4.p3, jsonOBJ.pelaaja4.p4, jsonOBJ.pelaaja4.p5, jsonOBJ.pelaaja4.p6
            , jsonOBJ.pelaaja4.p7, jsonOBJ.pelaaja4.p8, jsonOBJ.pelaaja4.p9, jsonOBJ.pelaaja4.p10
            , jsonOBJ.pelaaja4.p11, jsonOBJ.pelaaja4.p12, pelaajaid[0].pelaajaid])
        }

      }

      if(jsonOBJ.pelaaja5.nimi !== ""){
        sqlquery = "SELECT pelaajaid FROM Pelaajat WHERE nimi = ? and ryhmaid = ?";
        pelaajaid = await query(sqlquery,[jsonOBJ.pelaaja5.nimi, ryhmaid[0].ryhmaid]);

        if(voittajaid[0].pelaajaid === pelaajaid[0].pelaajaid){

          await query(sqlqueryVoitto,[jsonOBJ.pelaaja5.p0, jsonOBJ.pelaaja5.p1, jsonOBJ.pelaaja5.p2
            , jsonOBJ.pelaaja5.p3, jsonOBJ.pelaaja5.p4, jsonOBJ.pelaaja5.p5, jsonOBJ.pelaaja5.p6
            , jsonOBJ.pelaaja5.p7, jsonOBJ.pelaaja5.p8, jsonOBJ.pelaaja5.p9, jsonOBJ.pelaaja5.p10
            , jsonOBJ.pelaaja5.p11, jsonOBJ.pelaaja5.p12, pelaajaid[0].pelaajaid])
        }else{

          await query(sqlqueryHavio,[jsonOBJ.pelaaja5.p0, jsonOBJ.pelaaja5.p1, jsonOBJ.pelaaja5.p2
            , jsonOBJ.pelaaja5.p3, jsonOBJ.pelaaja5.p4, jsonOBJ.pelaaja5.p5, jsonOBJ.pelaaja5.p6
            , jsonOBJ.pelaaja5.p7, jsonOBJ.pelaaja5.p8, jsonOBJ.pelaaja5.p9, jsonOBJ.pelaaja5.p10
            , jsonOBJ.pelaaja5.p11, jsonOBJ.pelaaja5.p12, pelaajaid[0].pelaajaid])
        }

      }

      if(jsonOBJ.pelaaja6.nimi !== ""){
        sqlquery = "SELECT pelaajaid FROM Pelaajat WHERE nimi = ? and ryhmaid = ?";
        pelaajaid = await query(sqlquery,[jsonOBJ.pelaaja6.nimi, ryhmaid[0].ryhmaid]);

        if(voittajaid[0].pelaajaid === pelaajaid[0].pelaajaid){

          await query(sqlqueryVoitto,[jsonOBJ.pelaaja6.p0, jsonOBJ.pelaaja6.p1, jsonOBJ.pelaaja6.p2
            , jsonOBJ.pelaaja6.p3, jsonOBJ.pelaaja6.p4, jsonOBJ.pelaaja6.p5, jsonOBJ.pelaaja6.p6
            , jsonOBJ.pelaaja6.p7, jsonOBJ.pelaaja6.p8, jsonOBJ.pelaaja6.p9, jsonOBJ.pelaaja6.p10
            , jsonOBJ.pelaaja6.p11, jsonOBJ.pelaaja6.p12, pelaajaid[0].pelaajaid])
        }else{

          await query(sqlqueryHavio,[jsonOBJ.pelaaja6.p0, jsonOBJ.pelaaja6.p1, jsonOBJ.pelaaja6.p2
            , jsonOBJ.pelaaja6.p3, jsonOBJ.pelaaja6.p4, jsonOBJ.pelaaja6.p5, jsonOBJ.pelaaja6.p6
            , jsonOBJ.pelaaja6.p7, jsonOBJ.pelaaja6.p8, jsonOBJ.pelaaja6.p9, jsonOBJ.pelaaja6.p10
            , jsonOBJ.pelaaja6.p11, jsonOBJ.pelaaja6.p12, pelaajaid[0].pelaajaid])
        }

      }

      if(jsonOBJ.pelaaja7.nimi !== ""){
        sqlquery = "SELECT pelaajaid FROM Pelaajat WHERE nimi = ? and ryhmaid = ?";
        pelaajaid = await query(sqlquery,[jsonOBJ.pelaaja7.nimi, ryhmaid[0].ryhmaid]);

        if(voittajaid[0].pelaajaid === pelaajaid[0].pelaajaid){

          await query(sqlqueryVoitto,[jsonOBJ.pelaaja7.p0, jsonOBJ.pelaaja7.p1, jsonOBJ.pelaaja7.p2
            , jsonOBJ.pelaaja7.p3, jsonOBJ.pelaaja7.p4, jsonOBJ.pelaaja7.p5, jsonOBJ.pelaaja7.p6
            , jsonOBJ.pelaaja7.p7, jsonOBJ.pelaaja7.p8, jsonOBJ.pelaaja7.p9, jsonOBJ.pelaaja7.p10
            , jsonOBJ.pelaaja7.p11, jsonOBJ.pelaaja7.p12, pelaajaid[0].pelaajaid])
        }else{

          await query(sqlqueryHavio,[jsonOBJ.pelaaja7.p0, jsonOBJ.pelaaja7.p1, jsonOBJ.pelaaja7.p2
            , jsonOBJ.pelaaja7.p3, jsonOBJ.pelaaja7.p4, jsonOBJ.pelaaja7.p5, jsonOBJ.pelaaja7.p6
            , jsonOBJ.pelaaja7.p7, jsonOBJ.pelaaja7.p8, jsonOBJ.pelaaja7.p9, jsonOBJ.pelaaja7.p10
            , jsonOBJ.pelaaja7.p11, jsonOBJ.pelaaja7.p12, pelaajaid[0].pelaajaid])
        }

      }

      if(jsonOBJ.pelaaja8.nimi !== ""){
        sqlquery = "SELECT pelaajaid FROM Pelaajat WHERE nimi = ? and ryhmaid = ?";
        pelaajaid = await query(sqlquery,[jsonOBJ.pelaaja8.nimi, ryhmaid[0].ryhmaid]);

        if(voittajaid[0].pelaajaid === pelaajaid[0].pelaajaid){

          await query(sqlqueryVoitto,[jsonOBJ.pelaaja8.p0, jsonOBJ.pelaaja8.p1, jsonOBJ.pelaaja8.p2
            , jsonOBJ.pelaaja8.p3, jsonOBJ.pelaaja8.p4, jsonOBJ.pelaaja8.p5, jsonOBJ.pelaaja8.p6
            , jsonOBJ.pelaaja8.p7, jsonOBJ.pelaaja8.p8, jsonOBJ.pelaaja8.p9, jsonOBJ.pelaaja8.p10
            , jsonOBJ.pelaaja8.p11, jsonOBJ.pelaaja8.p12, pelaajaid[0].pelaajaid])
        }else{

          await query(sqlqueryHavio,[jsonOBJ.pelaaja8.p0, jsonOBJ.pelaaja8.p1, jsonOBJ.pelaaja8.p2
            , jsonOBJ.pelaaja8.p3, jsonOBJ.pelaaja8.p4, jsonOBJ.pelaaja8.p5, jsonOBJ.pelaaja8.p6
            , jsonOBJ.pelaaja8.p7, jsonOBJ.pelaaja8.p8, jsonOBJ.pelaaja8.p9, jsonOBJ.pelaaja8.p10
            , jsonOBJ.pelaaja8.p11, jsonOBJ.pelaaja8.p12, pelaajaid[0].pelaajaid])
          }

      }

      if(jsonOBJ.pelaaja9.nimi !== ""){
        sqlquery = "SELECT pelaajaid FROM Pelaajat WHERE nimi = ? and ryhmaid = ?";
        pelaajaid = await query(sqlquery,[jsonOBJ.pelaaja9.nimi, ryhmaid[0].ryhmaid]);

        if(voittajaid[0].pelaajaid === pelaajaid[0].pelaajaid){

          await query(sqlqueryVoitto,[jsonOBJ.pelaaja9.p0, jsonOBJ.pelaaja9.p1, jsonOBJ.pelaaja9.p2
            , jsonOBJ.pelaaja9.p3, jsonOBJ.pelaaja9.p4, jsonOBJ.pelaaja9.p5, jsonOBJ.pelaaja9.p6
            , jsonOBJ.pelaaja9.p7, jsonOBJ.pelaaja9.p8, jsonOBJ.pelaaja9.p9, jsonOBJ.pelaaja9.p10
            , jsonOBJ.pelaaja9.p11, jsonOBJ.pelaaja9.p12, pelaajaid[0].pelaajaid])
        }else{

          await query(sqlqueryHavio,[jsonOBJ.pelaaja9.p0, jsonOBJ.pelaaja9.p1, jsonOBJ.pelaaja9.p2
            , jsonOBJ.pelaaja9.p3, jsonOBJ.pelaaja9.p4, jsonOBJ.pelaaja9.p5, jsonOBJ.pelaaja9.p6
            , jsonOBJ.pelaaja9.p7, jsonOBJ.pelaaja9.p8, jsonOBJ.pelaaja9.p9, jsonOBJ.pelaaja9.p10
            , jsonOBJ.pelaaja9.p11, jsonOBJ.pelaaja9.p12, pelaajaid[0].pelaajaid])
        }

      }

      if(jsonOBJ.pelaaja10.nimi !== ""){
        sqlquery = "SELECT pelaajaid FROM Pelaajat WHERE nimi = ? and ryhmaid = ?";
        pelaajaid = await query(sqlquery,[jsonOBJ.pelaaja10.nimi, ryhmaid[0].ryhmaid]);

        if(voittajaid[0].pelaajaid === pelaajaid[0].pelaajaid){

          await query(sqlqueryVoitto,[jsonOBJ.pelaaja10.p0, jsonOBJ.pelaaja10.p1, jsonOBJ.pelaaja10.p2
            , jsonOBJ.pelaaja10.p3, jsonOBJ.pelaaja10.p4, jsonOBJ.pelaaja10.p5, jsonOBJ.pelaaja10.p6
            , jsonOBJ.pelaaja10.p7, jsonOBJ.pelaaja10.p8, jsonOBJ.pelaaja10.p9, jsonOBJ.pelaaja10.p10
            , jsonOBJ.pelaaja10.p11, jsonOBJ.pelaaja10.p12, pelaajaid[0].pelaajaid])
        }else{

          await query(sqlqueryHavio,[jsonOBJ.pelaaja10.p0, jsonOBJ.pelaaja10.p1, jsonOBJ.pelaaja10.p2
            , jsonOBJ.pelaaja10.p3, jsonOBJ.pelaaja10.p4, jsonOBJ.pelaaja10.p5, jsonOBJ.pelaaja10.p6
            , jsonOBJ.pelaaja10.p7, jsonOBJ.pelaaja10.p8, jsonOBJ.pelaaja10.p9, jsonOBJ.pelaaja10.p10
            , jsonOBJ.pelaaja10.p11, jsonOBJ.pelaaja10.p12, pelaajaid[0].pelaajaid])
        }
      }

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