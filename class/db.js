const mysql = require('mysql');

class DB {
    constructor(){
        this.con = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        this.connected = false;
    }

    async disconnect() {
        if(this.connected) {
            this.connected = false;
            this.con.end();
        }
    }

    async connect() {
        if(!this.connected) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.con.connect(function(err) {
                    if (err) reject(err);
                    // console.log("Connected!");
                    that.connected = true;
                    resolve(true);
                });
            });
        }
    }

    async load(startIndex) {
        var that = this;
        return new Promise(function(resolve, reject) {
            if(!that.connected) {
                reject('disconnected!');
            }

            let whereClause = '';
            if(startIndex) {
                startIndex = parseInt(startIndex, 10);
                if(!isNaN(startIndex)) {
                    whereClause = ` WHERE id > ${startIndex}`;
                }
            }

            that.con.query('SELECT * FROM `gathered_informations`' + whereClause, function (err, result) {
                if (err) reject(err);
                // console.log("Result: " + result);
                resolve(result);
            });
        });          
    }

    async add(data) {
        var that = this;
        return new Promise(function(resolve, reject) {
            if(!that.connected) {
                reject('disconnected!');
            }
            const addClause = `'${data.type}', '${data.action}', '${data.currency}', ${data.price}, ${data.sl}, '${JSON.stringify(data.tp)}'`;
            that.con.query('INSERT INTO `gathered_informations` (`type`, `action`, `currency`, `price`, `sl`, `tp`) VALUES (' + addClause + ')', function (err, result) {
                if (err) reject(err);
                resolve(result);
            });
        }); 
    }
}

module.exports = DB;