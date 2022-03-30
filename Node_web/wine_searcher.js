const fs =require('fs');
const util = require('util');
const moment = require('moment'); // 幫我們把時間戳記，將時間化成正規化後的文字

// 等下問一下 Python 的差別
const exec = util.promisify(require('child_process').exec);


// 再問一下 JQuery 的定義
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);


const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cookie': 'cookie_enabled=true; ID=CSZRC0VXFCQ00H8; IDPWD=I52141276; COOKIE_ID=CSZRC0VXFCQ00H8; visit=CSZRC0VXFCQ00H8%7C20200803130122%7C%2Ffind%2Flatour%2Bpauillac%2Bmedoc%2Bbordeaux%2Bfrance%2F2006%2Ftaiwan%7C%7Cend+; fflag=flag_store_manager%3A0%2Cend; _csrf=ZuvGVUcoEYrrvqj5QdDXEWhR8xniHVy4; _pxhd=e8120c9b8b70ba484d9044c0c9cd56693c70152cf5b83222bb51d0e4fccdf7d7:0c2b4040-d581-11ea-bf66-e1dbe49c3c85; _pxvid=0c2b4040-d581-11ea-bf66-e1dbe49c3c85; _ga_M0W3BEYMXL=GS1.1.1596456074.1.0.1596456074.0; _ga=GA1.2.1985482062.1596456075; _gid=GA1.2.1976576056.1596456075; __gads=ID=e983c12dabf45a02:T=1596456084:S=ALNI_MZsQurR7hSTqEuok7mec7ZBSI8ZGg; _px3=6faa2f746aa75c1d05a4ea6f5556bc4bad0f424e1030e418dbf23b71570b1a76:w8K68CoejrYe7v4iH+J5yEtxYpzu+S2qt4lAtSOKqN09d1cE//tlggsLcLYLWzNLQuYG5f2WLUIdzNPYs68yhQ==:1000:29QdgynXjlEj+QhogOoFawwCg17e/RWVNPXrhNuwZTUJu2hB7oN+iw3MWBj1gWj1AJkHhUnKzbbkJFUvBoRGTKQiJxPFqgkaPgBCd1FnkeKfjRMyqGA44hGxgm0uvO0Mqvct1mvws7u9YLYma1ZmgE+52EXpc59rNmbwTuKKhqg=; _px2=eyJ1IjoiMDcxNGMyYzAtZDU4MS0xMWVhLTk2ZjMtMTVhNjZiMDE2YjY4IiwidiI6IjBjMmI0MDQwLWQ1ODEtMTFlYS1iZjY2LWUxZGJlNDljM2M4NSIsInQiOjE1OTY0NTcxMDY5MTUsImgiOiI4MWIyNjJiZTEzZGMyYTE0NWQ0OWI5NmZkNjNkZjQyMzUyOGQwN2JmNWUzNGY2YWYxOTlmYjAxNGZhYWNlNTdlIn0=; _pxde=b4e388ff1e0f7b55b0ee77a17ec79f0180677eb866a2011079cc3aa76b8a5081:eyJ0aW1lc3RhbXAiOjE1OTY0NTY4MDY5MTYsImZfa2IiOjAsImlwY19pZCI6W119; search=start%7Clatour%2Bpauillac%2Bmedoc%2Bbordeaux%2Bfrance%7C2006%7Cany%7CTWD%7C%7C%7C%7C%7C%7C%7C%7C%7Ce%7Ci%7Cend'
};


let arrLink = [];

let url = `https://www.wine-searcher.com/find/screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa/1992/taiwan#t3`;

let arrUrl = [
    'https://www.wine-searcher.com/find/screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa/1992/taiwan#t3',
    'https://www.wine-searcher.com/find/latour+pauillac+medoc+bordeaux+france/2006/taiwan#t3'
];


(
    async function() {
        for(let url of arrUrl){
            let{stdout,stderr} = await exec(
                `curl `+
                `-X GET ${url} ` +
                `-L `+
                `-H "User-Agent: ${headers['User-Agent']}" `+
                `-H "Accept-Language: ${headers['Accept-Language']}" ` + 
                `-H "Accept: ${headers['Accept']}" ` + 
                `-H "Cookie: ${headers['Cookie']}" `
            );

            let strChartData = '';
            let datachartData ={};
            let arrMin =[];
            let strDateTime = '';
            let price =0;

            // 中間的小括號 -> 將正規表達式在各自取出括號裡面的成為 Group1 與 Group2
            let pattern = /https:\/\/www\.wine-searcher\.com\/find\/([a-z+]+)\/(1[0-9]{3}|20[0-9]{2})\/taiwan#t3/g;
            let arrMatch = null;
            let strJsonFileName ='';

            if( (arrMatch = pattern.exec(url))!==null){
                strJsonFileName = arrMatch[1];
                strJsonFileName = strJsonFileName.replace(/\+/g,'_');
                strJsonFileName = strJsonFileName + "_" + arrMatch[2];
            }

            console.log(strJsonFileName);

            strChartData = $(stdout).find('div#hst_price_div_detail_page.card-graph').attr('data-chart-data');
            dataChartData = JSON.parse(strChartData);
            arrMain = dataChartData.chartData.main;

            for(let arr of arrMain){
                strDateTime = moment.unix(parseInt(arr[0])/1000).format("YYYY-MM-DD");

                price = Math.round(arr[1]);

                arrLink.push({
                    'dateTime': strDateTime,
                    'price_us': price,
                    'price_tw':(price*30)
                });

                
            }

            console.log(arrLink);

                await fs.writeFileSync(`downloads/${strJsonFileName}.json`, JSON.stringify(arrLink,null,4));
            
                arrLink = [];
        }
    }

)();