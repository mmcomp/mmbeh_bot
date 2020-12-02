'use strict';

const { Client } = require('tdl');
const { TDLib } = require('tdl-tdlib-ffi');
require('dotenv').config();

const ConfigsClass = require("./class/configs");

const client = new Client(new TDLib(process.env.TDLIB_PATH), {
    apiId: process.env.API_ID, 
    apiHash: process.env.API_HASH,
    databaseDirectory: process.env.DATABASE_DIRECTORY,
    filesDirectory: process.env.FILE_DIRECTORY
});

async function main() {
  const configsObject = new ConfigsClass();
  const configs = await configsObject.getConfigs();
  
  if(!configs.enable_main_bot){
    process.exit();
  }

  client
  .on('update', update => {
    if(update._=="updateChatLastMessage" && configs.groupIds.indexOf(update.chat_id)>=0){
      const msg = update.last_message.content.text.text.toLowerCase().split("\n");
      if(msg.length>1 && (msg[0].indexOf('sell')>=0 || msg[0].indexOf('buy')>=0)){
        const action = (msg[0].indexOf('sell')>=0? 'sell' : 'buy');
        const actionIndex = msg[0].indexOf(action);
        const firstStatment = msg[0].split(' ');
        let currency;
        let price;
        let sl;
        let tp = [];
        if(actionIndex==0) {
          currency = firstStatment[1].toUpperCase();
          price = firstStatment[3].substring(0, firstStatment[3].length-1);
          for(let i = 1;i < msg.length;i++) {
            if(msg[i].indexOf('sl')>=0) {
              sl = msg[i].split(': ')[1];
            }else if(msg[i].indexOf('tp')>=0) {
              tp.push(msg[i].split(': ')[1]);
            }
          }
        } else  {
          currency = firstStatment[0].toUpperCase();
          price = firstStatment[2];
          for(let i = 1;i < msg.length;i++) {
            if(msg[i].indexOf('sl')>=0) {
              sl = msg[i].split(' ')[1];
            }else if(msg[i].indexOf('tp')>=0) {
              tp.push(msg[i].split(' ')[1]);
            }
          }
        }
        console.log('Action :', action);
        console.log('Currency :', currency);
        console.log('Price :', price);
        console.log('sl :', sl);
        console.log('tp :', tp);
      }
    }
  })
  .on('error', err => {
    // console.error('Got error:', err)
  })
  .on('destroy', () => {
    // console.log('destroy event')
  })
  await client.connectAndLogin();
}

main();