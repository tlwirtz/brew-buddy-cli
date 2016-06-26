#!/usr/bin/env node --use_strict

const program = require('commander');
const superagent = require('superagent-use');
const superPromise = require('superagent-promise-plugin');
const chalk = require('chalk');

superagent.use(superPromise);

const signup = function(user, pass) {
  const url = process.env.BREW_BUDDY_REMOTE;
  return new Promise((resolve, reject) => {
    superagent
      .post(url + 'api/signup')
      .set('Content-Type', 'application/json')
      .send({username: user, password: pass})
      .then((res) => {
        process.env.BREW_BUDDY_USER_TOKEN = res.text;
        resolve();})
      .catch(reject);
  });
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
    .catch((err) => console.log(chalk.red('there was an error', err.error.text)));
  });
program.parse(process.argv);
