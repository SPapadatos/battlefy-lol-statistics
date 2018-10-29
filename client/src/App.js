import React, { Component } from 'react';
import './App.css';
import { Grid, Row, Col } from 'react-bootstrap';
import Loader from 'react-loader-spinner';

class App extends Component {

  constructor() {
    super();
    this.handleSearch = this.handleSearch.bind(this);
  }

  state = {
    games: [],
    isLoading: false,
  };

  matchInfos = [];

  callApi = async (summonerName) => {
    var url = '/api/summoner/matches/matchinfo/' + summonerName;
    const response = await fetch(url);
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }

    return body;
  };

  handleSearch() {
    var summonerName = document.getElementById('input').value;
    this.setState({ games: [], isLoading: true });
    this.callApi(summonerName).then(res => {
      this.setState({ isLoading: false });
      this.setState({ games: res.matchInfos, loading: 0 });
    }).catch(err => {
      this.setState({ isLoading: false });
      console.log(err);
    });
  }

  loader() {
    if (this.state.isLoading) {
      return (<Loader className='Match-loader'
        type='Puff' color='#00BFFF' height='50' width='50'/>);
    }

    return;
  }

  formatPage() {
    var g = this.state.games;
    if (g == null) {
      return;
    }

    var html = [];
    for (var i = 0; i < g.length; i++) {
      if (g[i] == null) {
        return;
      }

      var {
        champion,
        creepScore,
        creepScorePerMinute,
        gameDuration,
        items,
        kda,
        level,
        spells,
        win,
      } = g[i];
      var {
        kills,
        deaths,
        assists,
      } = kda;
      var item0 = items[0];
      var item1 = items[1];
      var item2 = items[2];
      var item3 = items[3];
      var item4 = items[4];
      var item5 = items[5];
      var spellOne = spells[0];
      var spellTwo = spells[1];

      var result = 'Victory';
      if (!win) {
        result = 'Defeat';
      }

      html.push(<Col className='Match-record' xs={12}>
        <Row>
          <span className='Match-result'>{result}</span>
          <span className='Match-duration'>{gameDuration}</span>
        </Row>
        <Row>
          <p>
            <span className='Match-champion'>{champion}</span>
            <span className='Match-descriptor'>{' (lvl ' + level + ')'}</span>
            <br></br>
            {kills + '/' + deaths + '/' + assists + ' ' + creepScore + 'cs'}
            <span className='Match-descriptor'>{'(' + creepScorePerMinute + 'cs/mn)'}</span>
            <br></br>
            {spellOne + ', ' + spellTwo}</p>
        </Row>
        <Row>
          <img className='Match-item' alt=''
            src={'http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/' + item0}/>
          <img className='Match-item' alt=''
            src={'http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/' + item1}/>
          <img className='Match-item' alt=''
            src={'http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/' + item2}/>
          <img className='Match-item' alt=''
            src={'http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/' + item3}/>
          <img className='Match-item' alt=''
            src={'http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/' + item4}/>
          <img className='Match-item' alt=''
            src={'http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/' + item5}/>
        </Row>
      </Col>);
    }

    return html;
  }

  render() {
    return (<div>
      <div>
        <link rel='stylesheet'
          href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'
          integrity='sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u'
          crossOrigin='anonymous'>
        </link>
      </div>
      <div>
        <div className='Match-search'>
          <input id='input' className='Match-input' type='text' placeholder='summoner name'/>
          <button className='btn btn-primary' onClick={this.handleSearch}>Search</button>
          {this.loader()}
        </div>
        <Grid className='Match'>
          <Row>
            {this.formatPage()}
          </Row>
        </Grid>
      </div>
    </div>);
  }
}

export default App;
