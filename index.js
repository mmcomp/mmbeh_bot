'use strict';

const { Client } = require('tdl');
const { TDLib } = require('tdl-tdlib-ffi');
const DB = require('./class/db');
var http = require('http');
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
  const db = new DB();
  await db.connect();

  http.createServer(function (req, res) {
    let lastId = parseInt(req.url.replace('/', ''), 10);
    if(!isNaN(lastId)) {
      db.load(lastId).then(result => {
        result = {
          status: "success",
          code: 200,
          message: "ok",
          data: result
        };
        // console.log(JSON.stringify(result));
        res.write(JSON.stringify(result));
        res.end(); 
      }).catch(e => {
        e = {
          status: "error",
          code: 500,
          message: "notok",
          data: e
        };
        res.write(JSON.stringify(e));
        res.end(); 
      })
    }else {
      res.write('I am alive!');
      res.end();
    }
    
  }).listen(process.env.PORT); 

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
        let type;
        if(actionIndex==0) {
          type = 'red_emojy'
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
          type ='no_emojy';
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
        console.log('Type :', type);
        console.log('Action :', action);
        console.log('Currency :', currency);
        console.log('Price :', price);
        console.log('sl :', sl);
        console.log('tp :', tp);
        db.add({
          type,
          action,
          currency,
          price,
          sl,
          tp
        }).then().catch(e => {
          console.log('add error', e);
        });
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

