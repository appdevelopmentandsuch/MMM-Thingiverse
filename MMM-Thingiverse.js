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
    retryDelay: 5000,
    startAtRandom: false,
    thingCount: 100,
    updateInterval: 60000,
    numThingsDisplayed: 1,
    searchBy: 'popular',
    isFeatured: false,
  },

  requiresVersion: '2.1.0',

  start: function () {
    var self = this;
    var dataRequest = null;

    this.currentPage = 1;
    this.currentThingId = -1;
    this.iterations = 0;
    this.loaded = false;
    this.maxPages = 10;
    this.newRequestTimeout = 10000;
    this.things = { hits: [] };

    if (!['popular', 'newest'].includes(self.config.searchBy)) {
      self.config.searchBy = 'popular';
    }

    if (![1, 3, 5].includes(self.config.numThingsDisplayed)) {
      self.config.numThingsDisplayed = 3;
    }

    this.getData();

    setInterval(function () {
      self.updateDom();
    }, this.config.updateInterval);
  },

  getData: function () {
    var self = this;

    var urlApi = `https://api.thingiverse.com/search/?sort=${
      this.config.searchBy
    }&is_featured=${this.config.isFeatured ? 1 : 0}&access_token=${
      this.config.appToken
    }&per_page=${this.config.thingCount}&page=${
      self.currentPage % self.maxPages
    }`;
    var retry = true;

    var dataRequest = new XMLHttpRequest();
    dataRequest.open('GET', urlApi, true);
    dataRequest.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          self.iterations = 0;
          self.things = JSON.parse(this.response);
          self.currentThingId = self.config.startAtRandom
            ? Math.floor(Math.random() * self.things.hits.length)
            : 0;
          self.currentPage = self.currentPage + 1;
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
      self.getData();
    }, nextLoad);
  },

  createThingElement: function (thing) {
    var thingCard = document.createElement('div');
    thingCard.classList.add('MMM-Thingiverse-card');

    if (thing) {
      var thingCreator = document.createElement('div');
      thingCreator.classList.add('MMM-Thingiverse-creator');
      thingCreator.innerHTML = `<i>${thing.creator.name}</i>`;

      var thingName = document.createElement('div');
      thingName.classList.add('MMM-Thingiverse-name');
      thingName.innerHTML = `<b>${thing.name}</b>`;

      var thingThumbnail = document.createElement('img');
      thingThumbnail.classList.add('MMM-Thingiverse-thumbnail');
      thingThumbnail.src = thing.thumbnail;
      thingThumbnail.alt = thing.name;

      thingCard.appendChild(thingName);
      thingCard.appendChild(thingThumbnail);
      thingCard.appendChild(thingCreator);
    }

    return thingCard;
  },

  getDom: function () {
    var self = this;

    var wrapper = document.createElement('div');
    wrapper.classList.add('MMM-Thingiverse-wrapper');

    if (this.dataRequest) {
      for (var i = 0; i < self.config.numThingsDisplayed; i++) {
        var thing = this.dataRequest.hits[
          self.currentThingId % this.dataRequest.hits.length
        ];
        if (thing) {
          self.iterations = self.iterations + 1;

          if (self.iterations >= self.things.hits.length) {
            self.scheduleUpdate(self.newRequestTimeout);
          }

          self.currentThingId = self.currentThingId + 1;
          wrapper.appendChild(self.createThingElement(thing));
        }
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

    this.dataRequest = data;
    if (this.loaded === false) {
      self.updateDom(self.config.animationSpeed);
    }
    this.loaded = true;
  },

  socketNotificationReceived: function (notification, payload) {},
});
