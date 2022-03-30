const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true, width: 1280, height: 960 });

const fs = require('fs');
const util = require('util');
const exec = util.promisify( require('child_process').exec );

//引入 jQuery 機制
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);

const headers = {
    'User Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Language':'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};

let arrLink = [];
const url = "https://www.momoshop.com.tw/main/Main.jsp";

console.log('hi');

// 一定要先新增檔案，才可以把內容寫進去 ( 跟 json 檔不一樣 )
async function init(){
    //若沒有資料夾，則新增
    if( ! await fs.existsSync(`downloads/youtube`) ){
        await fs.mkdirSync(`downloads/youtube`, {recursive: true});
    }
}


async function visit(){
    await nightmare.wait(2000).goto(url, headers);
}


async function scroll(){
    let innerHeightOfWindow = 0;
    let totalOffset = 0;

    while(totalOffset <= innerHeightOfWindow){
        innerHeightOfWindow = await nightmare.evaluate(() => {
            return document.documentElement.scrollHeight;
        });

        totalOffset += 500;

        await nightmare.scrollTo(totalOffset);

        if( totalOffset > 1500 ){
            break;
        }

        console.log(`totalOffset: ${totalOffset}, innerHeightOfWindow: ${innerHeightOfWindow}`);

        await nightmare.wait(500);
    }
}


async function getProductTitles(){
    await nightmare.wait('div.epub ul[data-role="listview"] > li > a',3000);

    let html = await nightmare.evaluate(function() {
        return document.documentElement.innerHTML;
    });

    $(html).find('a[data-ajax="false"]').each((index,element) =>{
        let strTmp = $(element).attr('href');

        strTmp = strTmp.replace(/\.\.\//g, '');
        strTmp = decodeURIComponent(strTmp);

       
        let obj = {
            url: urlOrigin+'/'+strTmp+'#book_toc',
            title: $(element).text(),
            links: []
        };

        if(obj.title.indexOf("白馬")==-1){
            console.log(`getNovelTitles(): ${obj.url}`);
            arrLink.push(obj);
        }
    
    });
}

async function getNovelLinks(){
    //走訪所有文章
    console.log('Hi');
    
    for(let obj of arrLink){
        //走訪實際連結頁面
        await nightmare.goto(obj.url, headers);

        //等待小說連結完整顯示在網頁上
        await nightmare
        .wait('div[data-role="content"] > div > ul > li', 3000)
        .catch(function(err){
            return true;
        });
        // wait 是去找有沒有而已，關鍵是find
        //取得小說連結
        let html = await nightmare.evaluate(function() {
            return document.documentElement.innerHTML;
        });
        
        console.log('hei');
        
        //整合 href 的連結，並加上真實的目錄連結
        $(html).find('div[data-role="content"] > div > ul > li > a').each((index, element) => {
            
            let strTmp = $(element).attr('href');

            //暫存資料用的物件
            let objLink = {
                url: `${urlOrigin}${strTmp}`,
                title: $(element).text(),
                content:  null
            }; 

            console.log(`getNovelLinks(): ${strTmp}`);
            
            //目前走訪到的文章物件，在裡面的 links 屬性
            obj.links.push(objLink);
        });

        //讓瀏覽器強制等待
        await nightmare.wait(500);
    }
}

async function getNovelContent(){
    for(let obj of arrLink){
        for(let objLink of obj.links){
            //走訪實際連結頁面
            await nightmare.goto(objLink.url);

            console.log(`getNovelContent(): ${objLink.url}`);

            //等待小說連結完整顯示在網頁上
            await nightmare
            .wait('div#html[data-role="content"] > div:nth-of-type(1)', 3000)
            .catch(function(err){
                return true;
            });

            //取得當前 html 字串
            let html = await nightmare.evaluate(function() {
                return document.documentElement.innerHTML;
            }); 
            
            //取得小說內文 (含空白、斷行那些)
            let strContent = $(html).find('div#html[data-role="content"] > div:nth-of-type(1)').text();

            //將小說內文的空格、斷行全部去掉，讓文字變成「一整行文字」的概念
            objLink.content = strContent.replace(/\s|\r\n|\n/g, '');
        
            //讓瀏覽器強制等待
            await nightmare.wait(5000);
        }
    }
}

//關閉 chrome
async function close(){
    await nightmare.end(() => {
        console.log(`關閉 nightmare`);
    });
}

//將爬取資料儲存成 json 檔案
async function saveJson(){
    //新增檔案，同時寫入內容
    await fs.writeFileSync('downloads/jinyong.json', JSON.stringify(arrLink, null, 4));
}

//透過迴圈特性，將陣列中的各個 function 透過 await 逐一執行
async function asyncArray(functionsList) {
    for(let func of functionsList){
        await func();
    }
}


(
    async function(){
        await asyncArray([
            init,
            visit,
            getProductTitles,
            getNovelLinks,
            getNovelContent,
            close,
            saveJson
        ]).then(async function() {
            console.log('Done');     
        });
    }
)();
