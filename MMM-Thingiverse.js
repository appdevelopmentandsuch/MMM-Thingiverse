/* global Module */

/* Magic Mirror
 * Module: MMM-Thingiverse
 *
 * By Lucas Bock
 * MIT Licensed.
 */

Module.register('MMM-Thingiverse', {
  defaults: {
    appToken: '',
    updateInterval: 60000,
    retryDelay: 5000,
    thingCount: 100,
    startAtRandom: false,
  },

  requiresVersion: '2.1.0',

  start: function () {
    var self = this;
    var dataRequest = null;
    var dataNotification = null;

    this.currentThingId = -1;
    this.loaded = false;
    this.things = { hits: [] };

    this.getData();
    setInterval(function () {
      self.updateDom();
    }, this.config.updateInterval);
  },

  getData: function () {
    var self = this;

    var urlApi = `https://api.thingiverse.com/search/?sort=popular&access_token=${this.config.appToken}&per_page=${this.config.thingCount}`;
    var retry = true;

    var dataRequest = new XMLHttpRequest();
    dataRequest.open('GET', urlApi, true);
    dataRequest.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          self.things = JSON.parse(this.response);
          self.processData(self.things);
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
      self.currentThingId += 1;
      self.processData(self.things);
    }, nextLoad);
  },

  getDom: function () {
    var self = this;

    var wrapper = document.createElement('div');
    wrapper.classList.add('MMM-Thingiverse-wrapper');

    if (this.dataRequest) {
      var thing = this.dataRequest.hits[self.currentThingId];
      self.currentThingId =
        (self.currentThingId + 1) % this.dataRequest.hits.length;

      if (thing) {
        var thingCreator = document.createElement('div');
        thingCreator.classList.add('MMM-Thingiverse-creator');
        thingCreator.innerHTML = thing.creator.name;

        var thingName = document.createElement('label');
        thingName.classList.add('MMM-Thingiverse-name');
        thingName.innerHTML = thing.name;

        var thingThumbnail = document.createElement('img');
        thingThumbnail.classList.add('MMM-Thingiverse-thumbnail');
        thingThumbnail.src = thing.thumbnail;

        wrapper.appendChild(thingName);
        wrapper.appendChild(thingCreator);
        wrapper.appendChild(thingThumbnail);
      }
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
    this.currentThingId = this.config.startAtRandom
      ? Math.floor(Math.random() * data.hits.length + 1)
      : 0;
    this.dataRequest = data;
    if (this.loaded === false) {
      self.updateDom(self.config.animationSpeed);
    }
    this.loaded = true;
    this.sendSocketNotification('MMM-Thingiverse-NOTIFICATION_TEST', data);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'MMM-Thingiverse-NOTIFICATION_TEST') {
      this.dataNotification = payload;
      this.updateDom();
    }
  },
});
