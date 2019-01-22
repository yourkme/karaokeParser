const request = require('request');

module.exports = (url)=>{
    return new Promise((resolve, reject)=>{
        request(url, (err, resp, body)=>{
            if(err) reject(err);
            resolve(resp);
        });
    });
}