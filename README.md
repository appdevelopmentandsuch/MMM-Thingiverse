# MMM-Thingiverse

[![CodeFactor](https://www.codefactor.io/repository/github/appdevelopmentandsuch/mmm-thingiverse/badge/main)](https://www.codefactor.io/repository/github/appdevelopmentandsuch/mmm-thingiverse/overview/main)

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

Display 3D printable objects found on Thingiverse
![Screenshot from 2021-02-20 07-37-07](https://user-images.githubusercontent.com/22528729/108597418-89b64800-734e-11eb-90c5-a78c7f01bd71.png)
![Screenshot from 2021-02-20 07-37-33](https://user-images.githubusercontent.com/22528729/108597419-8a4ede80-734e-11eb-8643-2063ada05341.png)
![Screenshot from 2021-02-20 07-38-44](https://user-images.githubusercontent.com/22528729/108597457-c41fe500-734e-11eb-8f7f-ff8b95c21a26.png)
![Screenshot from 2021-02-20 07-40-01](https://user-images.githubusercontent.com/22528729/108597474-ddc12c80-734e-11eb-92ec-2fbdcc4ba0ab.png)
![Screenshot from 2021-02-20 07-40-07](https://user-images.githubusercontent.com/22528729/108597475-de59c300-734e-11eb-82c3-f52ef78004f5.png)

## Quickstart

```bash
cd ~/MagicMirror/modules
git clone https://github.com/appdevelopmentandsuch/MMM-Thingiverse
```

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:

```js
var config = {
  modules: [
    {
      module: 'MMM-Thingiverse',
      position: 'bottom_bar',
      config: {
        appToken: '',
      },
    },
  ],
};
```

## Configuration options

| Option               | Description                                                                                                                                                                                                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appToken`           | _Required_ A token aquired from the Thingiverse REST API to fetch things. You can aquire a token by going to https://www.thingiverse.com/apps/create and creating a **Web App**                                                                                                                 |
| `updateInterval`     | _Optional_ The time in milliseconds before switching to the next thing. <br><br>**Type:** `int`(milliseconds) <br>Default 60000 milliseconds (1 minute)                                                                                                                                         |
| `retryDelay`         | _Optional_ The time in milliseconds before retrying the Thingiverse REST API due to a previous failure to get things. <br><br>**Type:** `int`(milliseconds) <br>Default 5000 milliseconds (5 seconds)                                                                                           |
| `thingCount`         | _Optional_ The number of things you wish to grab and cycle through. <br><br>**Type:** `int`(count) <br>Default 100                                                                                                                                                                              |
| `startAtRandom`      | _Optional_ Start at a random position in the things. <br><br>**Type:** `boolean`(true/false) <br>Default false                                                                                                                                                                                  |
| `numThingsDisplayed` | _Optional_ Display 1, 3, or 5 things at any given time. <br><br>**Type:** `int`(1,3,5) <br>Default 1                                                                                                                                                                                            |
| `category`           | _Optional_ Display things based on a provided category. A list of valid categories can be grabbed from the Thingiverse API using the endpoint `https://api.thingiverse.com/categories?access_token=[YOUR_APP_TOKEN]`. Use the `slug` entry for this prop <br><br>**Type:** `string` <br>Default |
