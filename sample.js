
var login = process.env.LOGIN;
var pass = process.env.PASS;
var Api = require('./')(login, pass);

Api
  .getPoints()
  .then(response => console.log('getPoints', response))
  .catch(error => console.log('getPoints ERROR', error));

Api
  .getProfile()
  .then(response => console.log('getProfile', response))
  .catch(error => console.log('getProfile ERROR', error));

Api
  .addFinance({
    id: 1,
    profit: 15670.23,
    checks: 201,
    date: new Date(),

  })
  .then(response => {
    console.log(response);

    var options = {
      id: 1,
      datebegin: '2016-01-01',
      dateend: '2017-01-01',
      groupType: 1,
      isAllTime: false,
    };

    Api.getFinance(options)
      .then(response => console.log('getFullFinance', response))
      .catch(error => console.log('getFullFinance ERROR', error));

    Api.getFullFinance(options)
      .then(response => console.log('getFullFinance', response))
      .catch(error => console.log('getFullFinance ERROR', error));
  }).catch(error => console.log('ERROR', error));

Api
  .getVisitorsInMoment({
    id: 'all',
    datetime: '2016-05-06',
  })
  .then(response => console.log('getVisitorsInMoment', response))
  .catch(error => console.log('getVisitorsInMoment ERROR', error));

Api
  .getTraffic({
    id: 'all',
    datebegin: '2016-01-01',
    dateend: '2017-01-01',
    groupType: 3,
    isAllTime: true,
    UserTz: 3,
  })
  .then(response => console.log('getTraffic', response))
  .catch(error => console.log('getTraffic ERROR', error));

Api
  .getSIMReport({
    id: 'all',
    datebegin: '2016-01-01',
    dateend: '2017-01-01',
    isByWeek: false,
  })
  .then(response => console.log('getSIMReport', response))
  .catch(error => console.log('getSIMReport ERROR', error));
