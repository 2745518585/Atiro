const { execSync } = require('child_process')
const axios = require('axios');
const semver = require('semver');
const chalk = require('chalk');

const { setExitMessage } = require('./utils.js');
const config = require('./config.js');

async function check() {
  try {
    const result = await axios(`https://registry.npmjs.org/${require('../package.json').name}`);
    if (result.status != 200) throw 1;
    const latest = result.data['dist-tags'].latest;
    const current = require('../package.json').version;
    return newVersion = (semver.gt(latest, current) ? latest : 0);
  } catch (error) {
    return -1;
  }
}

async function start() {
  if (config.getConfigValue('update', 'type') != 'ignore') {
    const res = await check();
    if (res != 0 && res != 1) {
      if (config.getConfigValue('update', 'type') == 'auto') {
        console.log(chalk.blue('[Notice]'), 'Auto updating.');
        try {
          execSync('npm update -g atiro', { stdio: 'inherit' });
        } catch (error) {
          console.log(chalk.green('[Error]', 'Something went wrong when updating.'));
        }
      } else {
        setExitMessage(`${chalk.blue('[Notice]')} A new version ${res} found. Run \`${require('../package.json').name} update\` to update!`);
      }
    }
  }
}

async function update() {
  switch (await check()) {
    case 0:
      console.log(chalk.blue('[Notice]'), 'You are already up to date!');
      break;
    case -1:
      console.log(chalk.red('[Error]'), 'There is something wrong with the network.');
      break;
    default:
      try {
        execSync('npm update -g atiro', { stdio: 'inherit' });
      } catch (error) {
        console.log(chalk.green('[Error]', 'Something went wrong when updating.'));
      }
      break;
  }
}

function query() {
  console.log(config.getConfigValue('update', 'type'));
}

function set(val) {
  return () => { config.setConfigValue('update', 'type', val) };
}

module.exports = {
  start: start,
  update: update,
  query: query,
  set: set
}