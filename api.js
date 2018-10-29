const _kayn = require('kayn');
const Kayn = _kayn.Kayn;
const REGIONS = _kayn.REGIONS;

const config = {
    region: REGIONS.NORTH_AMERICA,
    locale: 'en_US',
    debugOptions: {
        isEnabled: true,
        showKey: false,
      },
    requestOptions: {
        shouldRetry: true,
        numberOfRetriesBeforeAbort: 3,
        delayBeforeRetry: 1000,
        burst: true,
        shouldExitOn403: false,
      },
    cacheOptions: {
        cache: null,
        timeToLives: {
            useDefault: false,
            byGroup: {},
            byMethod: {},
          },
      },
  };

const kayn = Kayn('RGAPI-91278897-cd1a-407c-8f78-1c5eae513926')(config);

const secondsInAMinute = 60;

async function getAccountId(accountName) {
  const { accountId } = await kayn.Summoner.by.name(accountName);
  return accountId;
}

//get list of all champions in the game
async function getChampionList() {
  const championList = await kayn.DDragon.Champion.list();
  return championList;
};

//get the most recent 12 games played by account id
async function getMatchObjects(accountId) {
  const { matches, totalGames } = await kayn.Matchlist.by
      .accountID(accountId)
      .query({ endIndex: 12 });

  var matchObjects = await buildMatchObjectList(matches);

  return matchObjects;
}

//get full match info for the 12 games
async function buildMatchObjectList(matches) {
  var matchObjects = [];
  var promises = [];
  for (var i = 0; i < matches.length; i++) {
    promises.push(getMatch(matches[i].gameId));
  }

  return Promise.all(promises);
}

async function getMatch(gameId) {
  return await kayn.Match.get(gameId);
}

module.exports = {
  getMatchInfos: async function (accountName) {
    const accountId = await getAccountId(accountName);
    const matchObjects = await getMatchObjects(accountId);

    var matchInfos = [];

    matchObjects.forEach(async function (match) {
      var participant =  getParticipant(match, accountId);
      matchInfos.push(getMatchInfo(participant, match.gameDuration)
                      .catch((err) => console.log(err)));
    });

    return Promise.all(matchInfos);
  },

};

function getParticipant(match, accountId) {
  var participants = match.participantIdentities;
  var participantNumber = -1;
  for (var i = 0; i < participants.length; i++) {
    if (participants[i].player.accountId == accountId) {
      participantNumber = i;
    }
  }

  return match.participants[participantNumber];
}

async function getChampionName(championId) {
  const championList = await kayn.DDragon.Champion.listDataByIdWithParentAsId().version('8.20.1');
  const championName = championList.data[championId].name;
  return championName;
}

//this is the main operation of this api
//it will properly format the data so the client has to perform little to not work other than
//displaying and formatting the data
async function getMatchInfo(participant, gameDuration) {
  var minutesInGame = (gameDuration / secondsInAMinute);
  var creepScorePerMinute =  participant.stats.totalMinionsKilled / minutesInGame;
  var creepScorePerMinute = creepScorePerMinute.toFixed(2);
  var championName = await getChampionName(participant.championId);
  var itemNames = await getParticipantItems(participant.stats);
  var spellNames = await getParticipantSpells(participant);
  var gameDurationString = getGameDurationString(gameDuration);
  return {
    win: participant.stats.win,
    gameDuration: gameDurationString,
    champion: championName,
    level: participant.stats.champLevel,
    kda: getKda(participant.stats),
    creepScore: participant.stats.totalMinionsKilled,
    creepScorePerMinute: creepScorePerMinute,
    spells: spellNames,
    items: itemNames,
  };
}

function getGameDurationString(gameDuration) {
  var minutes = Math.floor(gameDuration / secondsInAMinute);
  var seconds = gameDuration % secondsInAMinute;
  return minutes + 'mn ' + seconds + 'sec';
}

async function getParticipantItems(stats) {
  var itemNames = [];
  var itemIds = [
    stats.item0, stats.item1, stats.item2, stats.item3, stats.item4, stats.item5, stats.item6,
  ];
  for (var i = 0; i < itemIds.length; i++) {
    if (itemIds[i] != 0) {
      const items = await kayn.DDragon.Item.list().version('8.20.1');
      itemNames.push(items.data[itemIds[i]].image.full);
    } else {
      itemNames.push('None');
    }
  }

  return itemNames;
}

async function getParticipantSpells(participant) {
  var spellNames = [];
  const spells = await kayn.DDragon.SummonerSpell.list().version('8.20.1');
  for (var key in spells.data) {
    if (Number(spells.data[key].key) == participant.spell1Id ||
        Number(spells.data[key].key) == participant.spell2Id)
    {
      spellNames.push(spells.data[key].name);
    }
  }

  return spellNames;
}

function getKda(stats) {
  return { kills: stats.kills, deaths: stats.deaths, assists: stats.assists, };
}
