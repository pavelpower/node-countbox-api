var request = require('request').defaults({jar: true});
var moment = require('moment');
var geteway = 'https://deluxe.countbox.us/';

/**
 * Authentication request
 * @param passkey {String} base64 login & pass
 * @return {Promise}
 */
function auth(passkey) {
  var token;

  if (token) {
    return Promise.resolve(token);
  }

  return new Promise(function(resolve, reject) {
    request.get({url: geteway + '/api/json/token/get/' + passkey}, function(err, response, body) {
      if (err) {
        reject(err);
        return;
      }

      token = body.key;

      resolve(token);
    });
  });
}

function getHeadURL(format, path) {
  var _format = format === 'xml' ? 'xml' : 'json';
  return geteway + '/api/' + _format + '/' + path;
}

/**
 * Authentication & get requests methods
 * @param login {String} Web API login
 * @param password {String} Web API password
 * @param [format] {String} 'xml' or 'json' (default 'json')
 * @returns {{getPoints: Function, addFinance: Function, getFinance: Function, getFullFinance: Function, getVisitorsInMoment: Function, getTraffic: Function, getSIMReport: Function, getProfile: Function}}
 */
function Api(login, password, format) {
  var key, authPromise, _format;

  if (typeof login != 'string' || login.length === 0) {
    throw 'need set login';
  }

  if (typeof password != 'string' || password.length === 0) {
    throw 'need set password';
  }

  key = new Buffer(login.toString() + ':' + password.toString()).toString('base64');

  authPromise = auth(key);

  return {
    /**
     * Get all locations "points"
     * @param [format] {String} or 'xml' or 'json' (default 'json')
     * @returns {{promise, resolve, reject}}
     */
    getPoints: function(format) {
      return new Promise(function(resolve, reject) {
        authPromise
          .then(function(access_token) {
            request.post({
              url: getHeadURL(format, '/point/all/'),
              form: {
                access_token: access_token,
              },
            }, function(err, response, body) {
              if (err) {
                reject(err);
                return;
              }

              if (response.headers['content-type'].indexOf('application/json') > -1) {
                body = JSON.parse(body);
              }

              resolve(body);
            });
          }).catch(reject);
      });
    },

    /**
     * Put financial data on a server
     * @params data {Object} - financial data
     * @params data.id {Integer|String} - location (point) ID (required)
     * @params data.profit {Number} - (money) daily receipts (required)
     * @params data.checks {Number} - the number of checks per day (required)
     * @params data.date {Date|String} - report date. String format (ISO 8601) (required)
     * @returns {{promise, resolve, reject}}
     */
    addFinance: function(data) {
      return new Promise(function(resolve, reject) {
        if (!Number.isInteger(data.id) && typeof data.id !== 'string') {
          reject(new Error('id is not integer or not string type'));
          return;
        }

        if (!Number.isFinite(data.profit)) {
          reject(new Error('profit is not float type'));
          return;
        }

        if (!Number.isInteger(data.checks)) {
          reject(new Error('checks is not integer type'));
          return;
        }

        try {
          data.date = moment(data.date).format(); // "2014-09-08T08:02:17-05:00" (ISO 8601)
        } catch (e) {
          reject(e);
          return;
        }

        authPromise
          .then(function(access_token) {
            request.post({
              url: getHeadURL(format, '/point/addfinance/'),
              form: {
                access_token: access_token,
                id: data.id,
                profit: data.profit,
                checks: data.checks,
                date: data.date,
              },
            }, function(err, response, body) {
              if (err) {
                reject(new Error(err));
                return;
              }

              if (response.headers['content-type'].indexOf('application/json') > -1) {
                body = JSON.parse(body);
              }

              if (body.hasOwnProperty('result') && body.result || /<result>1<\/result>/.test(body)) {
                resolve(body);
              } else {
                reject(new Error('finance data is not save to Server'));
              }
            });
          }).catch(reject);
      });
    },

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
    getFinance: function(options, isFull) {
      return new Promise(function(resolve, reject) {
        var form_data;

        if (!Number.isInteger(options.id) && typeof options.id !== 'string') {
          reject(new Error('id is not integer or not string type'));
          return;
        }

        if (!Number.isInteger(options.groupType) && options.groupType < 1 && options.groupType > 3) {
          reject(new Error('groupType is an integer from 1 to 3, when 1 - day, 2 - month, 3 - year'));
          return;
        }

        if (options.hasOwnProperty('isAllTime')) {
          options.isAllTime = Boolean(options.isAllTime);
        }

        try {
          options.datebegin = moment(options.datebegin).format('YYYY-MM-DD'); // (ISO 8601)
          options.dateend = moment(options.dateend).format('YYYY-MM-DD'); // (ISO 8601)
        } catch (e) {
          reject(e);
          return;
        }

        form_data = options;

        authPromise
          .then(function(access_token) {
            form_data.access_token = access_token;

            request.post({
              url: getHeadURL(format, isFull ? '/point/getfullfinance/' : '/point/getfinance/'),
              form: form_data,
            }, function(err, response, body) {
              if (err) {
                reject(new Error(err));
                return;
              }
              if (response.headers['content-type'].indexOf('application/json') > -1) {
                body = JSON.parse(body);
              }
              resolve(body);
            });
          }).catch(reject);
      });
    },

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
    getFullFinance: function(options) {
      return this.getFinance(options);
    },

    /**
     * Getting the number of visitors that are on location (point) for the specified time
     * @param options {Object} - request params
     * @param options.id {Number|String} - ID of point, or IDs points sample: '1'; '1,2', 'all'
     * @param options.datetime {Date|String} - date & time of the moment
     * @returns {{promise, resolve, reject}}
     */
    getVisitorsInMoment: function(options) {
      return new Promise(function(resolve, reject) {
        if (!Number.isInteger(options.id) && typeof options.id !== 'string') {
          reject(new Error('id is not integer or not string type'));
          return;
        }

        try {
          options.datetime = moment(options.datetime).format(); // (ISO 8601)
        } catch (e) {
          reject(e);
          return;
        }

        authPromise
          .then(function(access_token) {
            request.post({
              url: getHeadURL(format, '/point/getvisitors/'),
              form: {
                access_token: access_token,
                id: options.id,
                datetime: options.datetime,
              },
            }, function(err, response, body) {
              if (err) {
                reject(err);
                return;
              }
              if (response.headers['content-type'].indexOf('application/json') > -1) {
                body = JSON.parse(body);
              }
              resolve(body);
            });
          }).catch(reject);
      });
    },

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
    getTraffic: function(options) {
      return new Promise(function(resolve, reject) {
        if (!Number.isInteger(options.id) && typeof options.id !== 'string') {
          reject(new Error('id is not integer or not string type'));
          return;
        }

        if (!Number.isInteger(options.groupType) && options.groupType < 1 && options.groupType > 3) {
          reject(new Error('groupType is an integer from 1 to 3, when 1 - 15 min, 2 - 1 hour, 3 - 1 day'));
          return;
        }

        try {
          options.datebegin = moment(options.datebegin).format(); // (ISO 8601)
          options.dateend = moment(options.dateend).format(); // (ISO 8601)
        } catch (e) {
          reject(e);
          return;
        }

        if (options.hasOwnProperty('isAllTime')) {
          options.isAllTime = Boolean(options.isAllTime);
        }

        if (options.hasOwnProperty('UserTz')) {
          if (Number.isInteger(options.UserTz)) {
            options.TzRequired = true;
          } else {
            reject(new Error('UserTz is not integer type'));
            return;
          }
        }

        authPromise
          .then(function(access_token) {
            options.access_token = access_token;
            request.post({
              url: getHeadURL(format, '/point/getattendance/'),
              form: options,
            }, function(err, response, body) {
              if (err) {
                reject(err);
                return;
              }
              if (response.headers['content-type'].indexOf('application/json') > -1) {
                body = JSON.parse(body);
              }
              resolve(body);
            });
          }).catch(reject);
      });
    },

    /**
     * Obtaining data for SIM-report for the period
     * @param options {Object} - request params
     * @param options.id {Number|String} - ID of point, or IDs points sample: '1'; '1,2', 'all'
     * @param options.datebegin {Date|String} - the date of the first week (month)
     * @param options.dateend {Date|String} - the date of the second week (month)
     * @param [options.isByWeek] {Boolean} - group by week (default by month)
     * @returns {{promise, resolve, reject}}
     */
    getSIMReport: function(options) {
      return new Promise(function(resolve, reject) {
        if (!Number.isInteger(options.id) && typeof options.id !== 'string') {
          reject(new Error('id is not integer or not string type'));
          return;
        }

        if (options.hasOwnProperty('isByWeek')) {
          options.isByWeek = Boolean(options.isByWeek);
        }

        try {
          options.datebegin = moment(options.datebegin).format('YYYY-MM-DD'); // (ISO 8601)
          options.dateend = moment(options.dateend).format('YYYY-MM-DD'); // (ISO 8601)
        } catch (e) {
          reject(e);
          return;
        }

        authPromise
          .then(function(access_token) {
            options.access_token = access_token;
            request.post({
              url: getHeadURL(format, '/point/getsimdata/'),
              form: options,
            },
            function(err, response, body) {
              if (err) {
                reject(err);
                return;
              }
              if (response.headers['content-type'].indexOf('application/json') > -1) {
                body = JSON.parse(body);
              }
              resolve(body);
            });
          }).catch(reject);
      });
    },

    /**
     * Get Profile data
     * @returns {{promise, resolve, reject}}
     */
    getProfile: function() {
      return new Promise(function(resolve, reject) {
        authPromise
          .then(function(access_token) {
            request.get({
              url: getHeadURL(format, '/profile/get/'),
              form: {access_token: access_token},
            },
            function(err, response, body) {
              if (err) {
                reject(err);
                return;
              }
              if (response.headers['content-type'].indexOf('application/json') > -1) {
                body = JSON.parse(body);
              }
              resolve(body);
            });
          }).catch(reject);
      });
    },
  };
}

/**
 * Recover password
 * @static
 * @param email {String} email for recover password
 * @param [format] {String} 'xml' or 'json' (default 'json')
 * @returns {{promise, resolve, reject}}
 */
Api.recoverPassword = function(email, format) {
  return new Promise(function(resolve, reject) {
    request.get({url: getHeadURL(format === 'xml' ? 'xml' : 'json', '/profile/recoverpassword/'), form: {email: email}},
      function(err, response, body) {
        if (err) {
          reject(err, response);
          return;
        }
        resolve(body, response);
      });
  });
};

module.exports = Api;
