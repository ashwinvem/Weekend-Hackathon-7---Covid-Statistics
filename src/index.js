const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 8080;

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require("./connector");
const { data } = require("./data");
const { STATES } = require("mongoose");

app.get("/totalRecovered", async (req, res) => {
  const data = await connection.find();

  let totalRecoveredPatients = 0;
  data.map((data) => {
    totalRecoveredPatients = data.recovered + totalRecoveredPatients;
  });
  res.send({data: { _id: "total", recovered: totalRecoveredPatients }});
});

app.get("/totalActive", async (req, res) => {
  const data = await connection.find();
  let totalActivePatients = 0;
  data.map((data) => {
    totalActivePatients += data.infected - data.recovered;
  });
  res.send({data: { _id: "total", active: totalActivePatients }});
});

app.get("/totalDeath", async (req, res) => {
  const data = await connection.find();

  let totalDeathPatients = 0;
  data.map((data) => {
    totalDeathPatients = data.death + totalDeathPatients;
  });
  res.send({data: { _id: "total", recovered: totalDeathPatients }});
});

app.get("/hotspotStates", async (req, res) => {
  const data = await connection.find();
  
  let resArr = [];
  data.map((data) => {
    let { state, infected, recovered, death,rate } = data;
    //connection.data.aggregate([{rate: {$round: [("$infected" - "$recovered")/"$infected",5]}}]);
    //console.log($round);
    if ((infected - recovered)/infected > 0.1) {
        //let val = $round: [rate,5];
      resArr.push({
        state: state,
        rate: ((infected - recovered)/infected).toFixed(5) ,
      });
    }
  });

  res.send({ data: resArr });
});

app.get("/healthyStates", async (req, res) => {
  const data = await connection.find();

  let resArr = [];
  data.map((data) => {
    let { state, infected, recovered, death } = data;
    if (death / infected < 0.005) {
      resArr.push({
        state: state,
        moratlity: (death / infected).toFixed(5),
      });
    }
  });
  res.send({ data: resArr });
});
app.listen(port, () => console.log(`App listening on port ${port}!`));

module.exports = app;
