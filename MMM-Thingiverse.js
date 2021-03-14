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
    category: '',
  },

  requiresVersion: '2.1.0',

  start: function () {
    var self = this;
    var dataRequest = null;

    this.currentPage = 1;
    this.currentThingId = -1;
    this.iterations = 0;
    this.loaded = false;
    this.maxPages = 11;
    this.newRequestTimeout = 10000;
    this.overrideUrl = null;
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

    var apiBase = 'https://api.thingiverse.com/';

    var apiConfig = `access_token=${this.config.appToken}&per_page=${this.config.thingCount}&page=${self.currentPage}`;

    var popularConfig = `search/?sort=${this.config.searchBy}&is_featured=${
      this.config.isFeatured ? 1 : 0
    }`;

    var categoryConfig = `categories/${this.config.category}/things`;
    var urlApi =
      apiBase +
      (this.config.category ? categoryConfig + '?' : popularConfig + '&') +
      apiConfig;

    var fallbackUrl = apiBase + popularConfig + '&' + apiConfig;

    var retry = true;

    if (self.overrideUrl != null && self.overrideUrl !== urlApi) {
      urlApi = self.overrideUrl;
    }

    var dataRequest = new XMLHttpRequest();
    dataRequest.open('GET', urlApi, true);
    dataRequest.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          self.iterations = 0;
          var parsedResponse = JSON.parse(this.response);
          if (
            (parsedResponse && Array.isArray(parsedResponse)) ||
            (parsedResponse.hits && Array.isArray(parsedResponse.hits))
          ) {
            self.things =
              self.config.category && self.overrideUrl === null
                ? parsedResponse
                : parsedResponse.hits;
            self.currentThingId = self.config.startAtRandom
              ? Math.floor(Math.random() * self.things.length)
              : 0;
            self.currentPage = Math.max(
              (self.currentPage + 1) % self.maxPages,
              1,
            );
            self.processData(self.things);
          }
        } else if (this.status === 401) {
          self.updateDom(self.config.animationSpeed);
          Log.error(self.name, this.status);
          self.overrideUrl = fallbackUrl;
          self.scheduleUpdate(self.loaded ? -1 : self.config.retryDelay);
        } else {
          Log.error(self.name, 'Could not load data.');
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
      thingThumbnail.src = thing.preview_image;
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
        var thing = self.things[self.currentThingId % self.things.length];
        if (thing) {
          self.iterations = self.iterations + 1;

          if (self.iterations >= self.things.length) {
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

    if (Array.isArray(data)) {
      this.dataRequest = data;
      if (this.loaded === false) {
        self.updateDom(self.config.animationSpeed);
      }
      this.loaded = true;
    }
  },

  socketNotificationReceived: function (notification, payload) {},
});
