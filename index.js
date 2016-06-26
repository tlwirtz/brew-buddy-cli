#!/usr/bin/env node --use_strict

const program = require('commander');
const request = rquire('superagent');
program
  .arguments('<file>')
  .option('-u, --username <username>', 'The user to authenticate as')
  .option('-p, --password <password>', 'The user\'s password')
  .action(function(file) {
    console.log('%s is trying to authenticate with %s', program.username, program.password);
  })
  .parse(process.argv);
