# CountBOX API v2 (NodeJS SDK)

for [countbox api v2](http://deluxe.count-box.com/doc/api.html)

[install nodejs](https://nodejs.org/en/) version >= 0.4.2, recommended version of nodejs >= 0.6.2

install package: `npm install node-countbox-api --save'

create file `touch sample.js`

write to file (smaple for Node >= 0.6):

```
var login = process.env.LOGIN;
var pass = process.env.PASS;
var Api = require('node-countbox-api')(login, pass);

Api
  .getProfile()
  .then(response => console.log('getProfile', response))
  .catch(error => console.log('getProfile ERROR', error));
```

and run: `LOGIN=userwebapi@server.com PASS=passwebapi node sample.js`;

All Functions:
```
var login = process.env.LOGIN;
var pass = process.env.PASS;
var countbox = require('node-countbox-api')

/**
 * Recover password
 * @static
 * @param email {String} email for recover password
 * @param [format] {String} 'xml' or 'json' (default 'json')
 * @returns {{promise, resolve, reject}}
 */
countbox.recoverPassword('username@server.com')

var Api = countbox(login, pass);

/**
 * Get Profile data
 * @returns {{promise, resolve, reject}}
 */
Api
  .getProfile()
  .then(response => console.log('getProfile', response))
  .catch(error => console.log('getProfile ERROR', error));

/**
 * Get all locations "points"
 * @param [format] {String} or 'xml' or 'json' (default 'json')
 * @returns {{promise, resolve, reject}}
 */
Api
  .getPoints()
  .then(response => console.log('getPoints', response))
  .catch(error => console.log('getPoints ERROR', error));

/**
 * Put financial data on a server
 * @params data {Object} - financial data
 * @params data.id {Integer|String} - location (point) ID (required)
 * @params data.profit {Number} - (money) daily receipts (required)
 * @params data.checks {Number} - the number of checks per day (required)
 * @params data.date {Date|String} - report date. String format (ISO 8601) (required)
 * @returns {{promise, resolve, reject}}
 */
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

    /**
     * Get financial data from server
     * @param options {Object} - request params
     * @param options.id {Number|String} - ID of point, or IDs points sample: '1'; '1,2', 'all'
     * @param options.datebegin {Date|String} - start date of the sample period
     * @param options.dateend {Date|String} - end date of the sample period
     * @param options.groupType {Number} - type grouping when 1 - day, 2 - month, 3 - year
     * @param [options.isAllTime] {Boolean} - if true - does not take into account the working hours
     * @param [isFull] - preparation of financial statistics data of visitors
     * @returns {{promise, resolve, reject}}
     */
    Api.getFinance(options)
      .then(response => console.log('getFullFinance', response))
      .catch(error => console.log('getFullFinance ERROR', error));

    /**
     * Preparation of financial statistics data of visitors
     * @param options {Object} - request params
     * @param options.id {Number|String} - ID of point, or IDs points sample: '1'; '1,2', 'all'
     * @param options.datebegin {Date|String} - start date of the sample period
     * @param options.dateend {Date|String} - end date of the sample period
     * @param options.groupType {Number} - type grouping when 1 - day, 2 - month, 3 - year
     * @param [options.isAllTime] {Boolean} - if true - does not take into account the working hours
     * @returns {{promise, resolve, reject}}
     */
    Api.getFullFinance(options)
      .then(response => console.log('getFullFinance', response))
      .catch(error => console.log('getFullFinance ERROR', error));
  }).catch(error => console.log('ERROR', error));

/**
 * Getting the number of visitors that are on location (point) for the specified time
 * @param options {Object} - request params
 * @param options.id {Number|String} - ID of point, or IDs points sample: '1'; '1,2', 'all'
 * @param options.datetime {Date|String} - date & time of the moment
 * @returns {{promise, resolve, reject}}
 */
Api
  .getVisitorsInMoment({
    id: 'all',
    datetime: '2016-05-06',
  })
  .then(response => console.log('getVisitorsInMoment', response))
  .catch(error => console.log('getVisitorsInMoment ERROR', error));

/**
 * Getting traffic for the period
 * @param options {Object} - request params
 * @param options.id {Number|String} - ID of point, or IDs points sample: '1'; '1,2', 'all'
 * @param options.datebegin {Date|String} - start date of the sample period
 * @param options.dateend {Date|String} - end date of the sample period
 * @param options.groupType {Number} - type grouping when 1 - 15 min, 2 - 1 hour, 3 - 1 day
 * @param [options.isAllTime] {Boolean} - if true - does not take into account the working hours
 * @param [options.UserTz] {Number} - UTC Time Zone (default server time zone). Sample: UserTz=6 equals UTC+6
 * @returns {{promise, resolve, reject}}
 */
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

/**
 * Obtaining data for SIM-report for the period
 * @param options {Object} - request params
 * @param options.id {Number|String} - ID of point, or IDs points sample: '1'; '1,2', 'all'
 * @param options.datebegin {Date|String} - start date of the sample period
 * @param options.dateend {Date|String} - end date of the sample period
 * @param [options.isByWeek] {Boolean} - group by week (default by month)
 * @returns {{promise, resolve, reject}}
 */
Api
  .getSIMReport({
    id: 'all',
    datebegin: '2016-01-01',
    dateend: '2017-01-01',
    isByWeek: false,
  })
  .then(response => console.log('getSIMReport', response))
  .catch(error => console.log('getSIMReport ERROR', error));

```