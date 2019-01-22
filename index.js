const request = require('./request');
const cheerio = require('cheerio');

const express = require('express');
const app = express();

async function tjmedia(search) {
    let $ = cheerio.load((await request('http://www.tjmedia.co.kr/tjsong/song_search_list.asp?strCond=0&strType=0&strText='+encodeURI(search))));
    let data = [];

    if(search==='39953' || ("무선랜설치가이드").indexOf(search) > -1) {
        data.push('39953', '무선랜설치가이드<TJ미디어 미제공값>', 'TJ미디어', 'TJ미디어', 'TJ미디어');
    }

    $('form > div > table > tbody > tr > td').each(function (i){
        if($(this).text().trim() !== '검색결과를 찾을수 없습니다.') {
            $(this).html().indexOf('<img class="mr_icon" src="/images/tjsong/60s_icon.png">') != -1 ? data.push($(this).text() + '<60s 이상>') : data.push($(this).text());
        }
    });

    let processedData = [];
    let song_length = data.length/5;
    
    //console.log(data);

    for(var i=0; i<song_length; i++) {
        data.length && processedData.push({
            id: data.shift(),
            title: data.shift(),
            artist: data.shift(),
            lyricst: data.shift(),
            composer: data.shift()
        });
        data.shift();
    }

    return processedData;
}

async function kumyoung(search) {
    let $ = cheerio.load((await request('http://m.kyentertainment.kr/songsearch/search.asp?gb=1&s_value='+encodeURI(search))));
    let data = [];

    $('section > div[class=table1] > table > tbody > tr > td').each(function (i){
        $(this).find('a').each(function(i) {
            if($(this).text() !== '') {
                data.push($(this).text());
            }
        });

        $(this).find('input').each(function(i) {
            let v = $(this).val();
            if(v.length !== 0) {
                if(data.slice(-3).toString().indexOf(v.trim()) > -1) {

                } else {
                    data.push(v.replace('작곡', '').replace('작사', '').trim());
                }
            } else {
                data.push("");
            }
        });
        
    });

    //console.log(data);
    
    
    let processedData = [];
    let song_length = data.length/5;
    
    //console.log(data);

    for(var i=0; i<song_length; i++) {
        data.length && processedData.push({
            id: data.shift(),
            title: data.shift(),
            artist: data.shift(),
            lyricst: data.shift(),
            composer: data.shift()
        });
    }

    return processedData;
}

app.get('/:provider/:id', (req, res)=>{

    let ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

    console.log('접속자 발생 - json API' + ip);
    
    switch(req.params.provider){
        case 'tj':
            tjmedia(req.params.id).then((songslist)=>{
                res.send(songslist);
            });
        break;
        case 'ky':
            kumyoung(req.params.id).then((songslist)=>{
                res.send(songslist);
            });
        break;
    }
});

app.get('/read/:provider/:id', (req,res)=>{
    console.log('접속자 발생 - 결과반환형');
    let arrResult = "";
    switch(req.params.provider){
        case 'tj':
            tjmedia(req.params.id).then((songlist)=>{
                songlist.forEach((elem)=>{
                    arrResult += elem.id + '번의 ' + elem.title + ', ';
                });
                if(arrResult.length <= 0) {arrResult = "결과가 없습니다"}
                let result = '요청하신 ' + req.params.id + '의 검색 결과는 아래와 같습니다. ' + arrResult + '이상입니다.';
                res.send(result);
            });
        break;
        case 'ky':
            kumyoung(req.params.id).then((songlist)=>{
                songlist.forEach((elem)=>{
                    arrResult += elem.id + '번의 ' + elem.title + ', ';
                });
                if(arrResult.length <= 0) {arrResult = "결과가 없습니다"}
                let result = '요청하신 ' + req.params.id + '의 검색 결과는 아래와 같습니다. ' + arrResult + '이상입니다.';
                res.send(result);
            });
        break;
    }
});

app.listen(80);