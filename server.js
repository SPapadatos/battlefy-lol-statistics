const express = require('express');
const util = require('util');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;
const api = require('./api')

app.get('/api/summoner/matches/matchinfo/:summonerName', (req, res) => {
  var summonerName = req.params.summonerName || "";
  api.getMatchInfos(summonerName)
    .then((matchInfos) => {
      res.send({matchInfos: matchInfos})
    }).catch((err) => console.log(err))
 });

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}
app.listen(port, () => console.log(`Listening on port ${port}`));
