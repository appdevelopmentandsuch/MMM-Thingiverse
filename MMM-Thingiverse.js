/* global Module */

/* Magic Mirror
 * Module: MMM-Thingiverse
 *
 * By
 * MIT Licensed.
 */

Module.register('MMM-Thingiverse', {
  defaults: {
    appToken: '',
    updateInterval: 60000,
    retryDelay: 5000,
  },

  requiresVersion: '2.1.0',

  start: function () {
    var self = this;
    var dataRequest = null;
    var dataNotification = null;

    this.thingId = -1;
    this.loaded = false;
    this.things = { total: 0, hits: [] };

    this.getData();
    setInterval(function () {
      self.updateDom();
    }, this.config.updateInterval);
  },

  getData: function () {
    var self = this;

    var urlApi = `https://api.thingiverse.com/search/?sort=popular&access_token=${this.config.appToken}`;
    var retry = true;

    var dataRequest = new XMLHttpRequest();
    dataRequest.open('GET', urlApi, true);
    dataRequest.onreadystatechange = function () {
      console.log(this.readyState);
      if (this.readyState === 4) {
        console.log(this.status);
        if (this.status === 200) {
          this.things = JSON.parse(this.response);
          self.processData(this.things);
        } else if (this.status === 401) {
          self.updateDom(self.config.animationSpeed);
          Log.error(self.name, this.status);
          retry = false;
        } else {
          Log.error(self.name, 'Could not load data.');
        }
        if (retry) {
          self.scheduleUpdate(self.loaded ? -1 : self.config.retryDelay);
        }
      }
    };
    dataRequest.send();
  },

  scheduleUpdate: function (delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== 'undefined' && delay >= 0) {
      nextLoad = delay;
    }
    nextLoad = nextLoad;
    var self = this;

    setTimeout(function () {
      self.thingId += 1;
      self.processData(self.things);
    }, nextLoad);
  },

  getDom: function () {
    var self = this;

    var wrapper = document.createElement('div');

    if (this.dataRequest) {
      var thing = this.dataRequest.hits[this.thingId];
      var wrapperDataRequest = document.createElement('div');
      wrapperDataRequest.innerHTML = thing.creator.name;

      var labelDataRequest = document.createElement('label');
      labelDataRequest.innerHTML = thing.name;

      var thumbnail = document.createElement('img');
      thumbnail.src = thing.thumbnail;

      wrapper.appendChild(labelDataRequest);
      wrapper.appendChild(wrapperDataRequest);
      wrapper.appendChild(thumbnail);
    }

    if (this.dataNotification) {
      var thing = this.dataRequest.hits[this.thingId];
      var wrapperDataRequest = document.createElement('div');
      wrapperDataRequest.innerHTML = thing.creator.name;

      var labelDataRequest = document.createElement('label');
      labelDataRequest.innerHTML = thing.name;

      var thumbnail = document.createElement('img');
      thumbnail.src = thing.thumbnail;

      wrapper.appendChild(labelDataRequest);
      wrapper.appendChild(wrapperDataRequest);
      wrapper.appendChild(thumbnail);
    }
    return wrapper;
  },

  getScripts: function () {
    return [];
  },

  getStyles: function () {
    return ['MMM-Thingiverse.css'];
  },

  getTranslations: function () {
    return {
      en: 'translations/en.json',
    };
  },

  processData: function (data) {
    var self = this;
    this.thingId = 0;
    this.dataRequest = data;
    if (this.loaded === false) {
      self.updateDom(self.config.animationSpeed);
    }
    this.loaded = true;
    console.log(data);
    this.sendSocketNotification('MMM-Thingiverse-NOTIFICATION_TEST', data);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'MMM-Thingiverse-NOTIFICATION_TEST') {
      this.dataNotification = payload;
      this.updateDom();
    }
  },
});
