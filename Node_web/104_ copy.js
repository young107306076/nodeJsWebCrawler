const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true, width: 1280, height: 1024});
const util = require('util');
const fs = require('fs');


const jsdom = require('jsdom');
const{ JSDOM } = jsdom;
const {window} = new JSDOM();
const $ = require('jquery')(window);

const writeFile = util.promisify(fs.writeFile);

const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};

let arrLink =[];

//let strKeyword = 'node.js';

async function browse(){
    console.log(`[browse]`);
// 對每一個按鈕的CSS選擇器進行動作
    await nightmare
    .goto('https://www.momoshop.com.tw/main/Main.jsp',headers)
    .click('span#icity')
    .wait(2000)
    .click('div.second-floor-rect input[value="6001001000"]')
    .wait(2000)
    .click('div.second-floor-rect input[value="6001002000"]')
    .wait(2000)
    .click('button.category-picker-btn-primary')
    .wait(2000)
    .click('button.btn.btn-primary.js-formCheck')
    .catch((err) => {
        throw err;
    });
}

async function setJobType(){
    console.log('選擇全職、兼職等選項');

    await nightmare
    .wait(3000)
    .click('ul#js-job-tab > li[data-value="1"]')
    .wait(3000);
}

async function scrollPage(){
    console.log('滾動頁面，將動態資料逐一顯示出來');

    let innerHeightOfWindow = 0, totalOffset =0;

    while(totalOffset <= innerHeightOfWindow){

        innerHeightOfWindow = await nightmare.evaluate(() => {
            return document.documentElement.scrollHeight;
        });

        totalOffset += 500;

        await nightmare.scrollTo(totalOffset,0).wait(500);

        console.log(`totalOffset = ${totalOffset}, innerHeightOfWindow = ${innerHeightOfWindow}`);
        if( totalOffset > 300 ){
            break;
        }

    }


}

async function parseHtml(){
    console.log('分析、整理、收集重要資訊');
    let html = await nightmare.evaluate(function(){
        return document.documentElement.innerHTML;
    });
    
    let obj={};
    
    $(html)
    .find('div#js-job-content article')
    .each(function(index, element){
        let elm = $(element).find('div.b-block__left');
        // 經過錢字號與.find 之後就會變 jquery物件了
        // jquery 物件就是所謂 { } 這種形式的 ( 選擇器形式 )
        let position = elm.find('h2.b-tit a.js-job-link').text();
        let companyName = elm.find('ul.b-list-inline.b-clearfix li a').text().trim();
        // jquery 有個 function 叫 trim，它可以幫你把網頁的空白處消除掉
        
    }
    )
}


async function asyncArray(functionList){
    for(let func of functionList){
        await func();
    }
}

(
    async function (){
        await asyncArray([
            browse,
            setJobType,
            scrollPage
        ]).then(async () =>{
            console.dir(arrLink, {depth: null});
            console.log('Done');
        });
    }
)();


