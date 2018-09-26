var express = require('express');
var router = express.Router();
var Papa = require('papaparse');
var MongoClient = require('mongodb').MongoClient
var assert = require('assert');
var fs = require('fs');
var diff = require('deep-diff').diff;
var postDataNew = '';
var postDataOld = "";

var parsedDataNew = [];
var parsedDataOld = [];

var url = 'mongodb://localhost:27017/';
//Establish Connection
const dbName = 'mydb';
router.get('/', function (req, res) {
  res.render('index')
})


function papaParsing(incomingData) {

  if (parsedDataNew.length !== 0) {
    parsedDataOld = parsedDataNew;
  }
  Papa.parse(incomingData, {
    header: true,
    delimiter: "\n",
    dynamicTyping: true,
    complete: function (results) {
      dataset(results.data);
      function dataset(parsedDataNew) {
      var i;
      var x = [];
      for (var i = 0; i < parsedDataNew.length; i++) {
        x.push(parsedDataNew[i].Date);
      }
      console.log(x) // json daki tarihler
      var newDateJson = [{}];
      var j = 0;
      var BreakException = {};
      var item;
      try {
        for (var i = 0; i < x.length; i++) {
          item = x[i]

          if (item === undefined) throw BreakException;

          var stringDate = item;
          stringDate = stringDate.split(" ");
          //console.log(stringDate);
          //tarihleri istediğimiz formata getirme
          switch (stringDate[1]) {
            case "Jan":
              stringDate[1] = "00";
              break;
            case "Fab":
              stringDate[1] = "01";
              break;
            case "Mar":
              stringDate[1] = "02";
              break;
            case "Apr":
              stringDate[1] = "03";
              break;
            case "May":
              stringDate[1] = "04";
              break;
            case "Jun":
              stringDate[1] = "05";
              break;
            case "Jul":
              stringDate[1] = "06";
              break;
            case "Aug":
              stringDate[1] = "07";
              break;
            case "Sep":
              stringDate[1] = "08";
              break;
            case "Oct":
              stringDate[1] = "09";
              break;
            case "Nov":
              stringDate[1] = "10";
              break;
            case "Dec":
              stringDate[1] = "11";
              break;
          }

          var dateToMongo = new Date(parseInt(stringDate[2]), parseInt(stringDate[1]), parseInt(stringDate[0]));
          var userTimezoneOffset = dateToMongo.getTimezoneOffset() * 60000;

          newDateJson[j] = new Date((dateToMongo.getTime() - userTimezoneOffset));
          j++;


        }
      }
      catch (e) {
        if (e !== BreakException) {
          console.log("This record is corrupted" + e);
          throw e;
        }

      }


      for (var i = 0; i < parsedDataNew.length; i++) {
        delete parsedDataNew[i].Date;
        parsedDataNew[i]["Date"] = newDateJson[i];
      }
      

      console.log(parsedDataNew);
      var differences = diff(parsedDataNew, parsedDataOld);
      console.log(differences);
      dbrecord(parsedDataNew);
    }
  }
  });
 
}


router.post('/test', function (req, res) {
  if (postDataNew !== '') {
    postDataOld = postDataNew;
  }
  req.on('data', function (data) {
    postDataNew += data;
    console.log("elimdeki veri \n" + postDataNew);
  });
  req.on('end', function () {
    res.end();
    papaParsing(postDataNew);
  });
  res.write('\r\nOK!\r\n');
  res.end();
  

});

function dbrecord(row){
 
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");

  dbo.createCollection("data", function (err, res) {
    if (err) throw err;
   console.log("Collection created!");
    dbo.collection("data").insert(row, function(err, res) {
      if (err) throw err;
     // console.log(rows)
      console.log("Number of documents inserted: " + res.insertedCount);
    });

    db.close();
  });
});
}



router.get('/data', function (req, res) {
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    findDocuments(db, function () {

    });
  });

  const findDocuments = function (db, callback) {

    const collection = db.collection('data');
    // Find some documents
    collection.find({}).toArray(function (err, docs) {
      assert.equal(err, null);
      //   console.log("Found the following records");
      // console.log(docs)
      callback(docs);

    });

    function callback(item) {

      res.send({
        users: item
      })
    }

  }

});
var MyApp = {
  start: null,

};

var app = {
  end: null,

};
router.get('/chart.html', function (req, res) {

  res.render('chart');


  router.post('/FindDate', function (req, res) {

    tarih = req.body.obj.tarih

    console.log(tarih)

    MongoClient.connect(url, function (err, client) {
      assert.equal(null, err);
      console.log("Connected successfully to server");

      const db = client.db(dbName);
      findDocuments(db, function () {

      });
    });

    const findDocuments = function (db, callback) {

      const collection = db.collection('data');
      // Find some documents
      collection.find({ "Date": new Date(tarih) }).toArray(function (err, docs) {
        assert.equal(err, null);
        console.log("Found the following records");
        //  console.log(docs)
        callback(docs);

      });

      function callback(item) {

        res.send({
          users: item
        })
      }

    }

  });

  router.post('/FindRange', function (req, res) {

    start = req.body.obj.start
    end = req.body.obj.end

    console.log(tarih)

    MongoClient.connect(url, function (err, client) {
      assert.equal(null, err);
      console.log("Connected successfully to server");

      const db = client.db(dbName);
      findDocuments(db, function () {

      });
    });

    const findDocuments = function (db, callback) {

      const collection = db.collection('data');
      // Find some documents
      collection.find({ "Date": { "$gte": new Date(start), "$lte": new Date(end) } }).toArray(function (err, docs) {
        assert.equal(err, null);
        console.log("Found the following records");
        //  console.log(docs)
        callback(docs);

      });

      function callback(item) {

        res.send({
          users: item
        })
      }

    }

  });

});



router.get('/dowload', function (req, res) {
  var user = rows;
  res.send(user);
})

module.exports = router;
