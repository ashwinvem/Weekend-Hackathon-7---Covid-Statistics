const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')


app.get('/totalRecovered',(request, response)=>{

    connection.find().then(data=>{
        let totalRecovered = 0;
        data.forEach(state=> totalRecovered+= (state.recovered));
        response.send( {data: {_id: "total", recovered: totalRecovered}});
    })
});

app.get('/totalActive',(request, response)=>{

    connection.find().then(data=>{
        let totalInfected = 0;
        let totalRecovered = 0;
        data.forEach(state=>{
            totalRecovered += state.recovered;
            totalInfected += state.infected;
        })
        response.send( {data: {_id: "total", active: totalInfected - totalRecovered}});
    });
});

app.get('/totalDeath',(request, response)=>{

    connection.find().then(data=>{
        let totalDeath = 0;
        data.forEach(state=> totalDeath += state.death);
        response.send( {data: {_id: "total", death: totalDeath}});
    });
});

app.get('/hotspotStates',(request, response)=>{

    connection.find().then(data=>{
        let hotspot = [];
        data.forEach(state=>{
            const rate = ((state.infected-state.recovered) / state.infected).toFixed(5);
            if(rate > 0.1){
                hotspot.push({
                    state: state.state,
                    rate: rate
                });
            }
        });
        response.send( {data: hotspot});
    });

});



app.get('/healthyStates',(request, response)=>{
    
    connection.find().then(data=>{
        let healthy = [];
        data.forEach(state=>{
            const morality = (state.death / state.infected).toFixed(5);
            if(morality < 0.005){
                healthy.push({
                    state: state.state,
                    morality: morality
                });
            }
        });
        response.send( {data: healthy});
    });
});

app.listen(port, () => console.log(`App listening on port ${port}!`))
module.exports = app;
