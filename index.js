#!/usr/bin/env node --use_strict

const program = require('commander');
const superagent = require('superagent-use');
const superPromise = require('superagent-promise-plugin');
const chalk = require('chalk');
const fs = require('fs');

require('console.table');

superagent.use(superPromise);

const writeToken = function(token) {
  return new Promise((resolve, reject) => {
    fs.writeFile('.token', token, (err) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
};

const getToken = function(){
  return fs.readFileSync('./.token');
};

const signup = function(user, pass) {
  const url = process.env.BREW_BUDDY_REMOTE;
  return new Promise((resolve, reject) => {
    superagent
      .post(url + 'api/signup')
      .set('Content-Type', 'application/json')
      .send({username: user, password: pass})
      .then((res) => {
        writeToken(res.text);
        resolve();
      })
      .catch(reject);
  });
};

const signin = function(user, pass) {
  const url = process.env.BREW_BUDDY_REMOTE;
  console.log('sigining in', user, pass);
  console.log('url', url);
  return new Promise((resolve, reject) => {
    superagent
      .get(url + 'api/signin')
      .set('Content-Type', 'application-json')
      .auth(user, pass)
      .then((res) => {
        return res.text;
      })
      .then((token) => writeToken(token))
      .then(() => resolve())
      .catch(reject);
  });
};

// refactor all of this out
const getAllEntries = function() {
  const url = process.env.BREW_BUDDY_REMOTE;
  const token = getToken();
  return new Promise((resolve, reject) => {
    superagent
      .get(url + 'api/entry/all')
      .set('Content-Type', 'application-json')
      .set('Authorization', 'Bearer ' + token)
      .then((res) => {
        resolve(res.text);
      })
      .catch(reject);
  });
};

const getAllFlavors = function() {
  const url = process.env.BREW_BUDDY_REMOTE;
  const token = getToken();
  return new Promise((resolve, reject) => {
    superagent
      .get(url + 'api/flavor/all')
      .set('Content-Type', 'application-json')
      .set('Authorization', 'Bearer ' + token)
      .then((res) => {
        resolve(res.text);
      })
      .catch(reject);
  });
};

const getAllOrigins = function() {
  const url = process.env.BREW_BUDDY_REMOTE;
  const token = getToken();
  return new Promise((resolve, reject) => {
    superagent
      .get(url + 'api/origin/all')
      .set('Content-Type', 'application-json')
      .set('Authorization', 'Bearer ' + token)
      .then((res) => {
        resolve(res.text);
      })
      .catch(reject);
  });
};

const formatOutput = function(entries, keys) {
  let idx = 1;
  const mappedEntries = entries.map((entry) => {
    if (!keys) return console.table(entries);

    let mappedEntry = {};
    keys.forEach((key) => {
      mappedEntry.index = idx;
      mappedEntry[key] = entry[key];
    });
    idx += 1;
    return mappedEntry;
  });

  console.table(mappedEntries);
};

program
  .option('-u, --username <username>', 'The user to authenticate as')
  .option('-p, --password <password>', 'The user\'s password');

program
  .command('signup')
  .description('signup for the BrewBuddy API')
  .action(function() {
    signup(program.username, program.password)
    .then(() => console.log(chalk.green('You signed up successfully') ))
    .catch((err) => console.log(chalk.red('there was an error ' + err.error)));
  });

program
  .command('get-entries')
  .description('get all the entires')
  .action(function() {
    getAllEntries()
    .then((entries) => formatOutput(JSON.parse(entries), ['username', 'date', 'originId', 'methodId']))
    .then()
    .catch((err) => console.log(chalk.red('error' + err.error.text)));
  });

program
    .command('get-flavors')
    .description('get all the flavors')
    .action(function() {
      getAllFlavors()
      .then((flavors) => formatOutput(JSON.parse(flavors), ['category', 'flavorType', 'title']))
      .then()
      .catch((err) => console.log(chalk.red('error' + err.error.text)));
    });

program
    .command('get-origins')
    .description('get all the origins')
    .action(function() {
      getAllOrigins()
      .then((origins) => formatOutput(JSON.parse(origins)))
      .then()
      .catch((err) => console.log(chalk.red('error' + err.error.text)));
    });

program
  .command('signin')
  .description('sign in for the BrewBuddy API')
  .action(function() {
    signin(program.username, program.password)
    .then(() => console.log(chalk.green('Signed in')))
    .catch((err) => console.log(chalk.red('There was an error ' + err)));
  });

program.parse(process.argv);
