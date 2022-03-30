const Nightmare = require('nightmare');
const nightmare = Nightmare({ show:true, width: 1024, height: 960});

const fs = require('fs');
const util = require('util');
const exec = util.promisify( require('child_process').exec);


const crypto = require('crypto');

const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);

const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};

const config = require("./ig_config.js");

const arrData = [], arrLink =[];

let objTmp = {};

const url = "https://www.instagram.com/ntu.library/";

async function init(){
    //若沒有資料夾，則新增
    if( ! await fs.existsSync(`downloads/ig`) ){
        await fs.mkdirSync(`downloads/ig`, {recursive: true});
    }
}

async function login(){
    await nightmare
    .goto("https://www.instagram.com", headers)
    .wait('input[name="username"]')
    .type('input[name="username"]', config.username)
    .type('input[name="password"]', config.password)
    .wait(3000)
    .click('button[type="submit"].sqdOP.L3NKy.y3zKF');
}

async function visit(){
    await nightmare.wait(2000).goto(url, headers);
}

async function scroll(){
    //等待第一列 (3 個照片元素為 1 列) //等他載完
    await nightmare.wait('div.Nnq7C.weEfm');

    /**
     * innertHeightOfWindow: 視窗內 document 區域的內部高度
     * totalOffset: 目前滾動的距離
     */
    let innerHeightOfWindow = 0, totalOffset = 0;

    //
    while(totalOffset <= innerHeightOfWindow){
        //取得視窗內 document 區域的內部高度
        innerHeightOfWindow = await nightmare.evaluate(() => {
            return document.documentElement.scrollHeight;
        });

        //增加滾動距離的數值
        totalOffset += 500;

        //滾動到 totalOffset 指定的距離
        await nightmare.scrollTo(totalOffset, 0).wait(1000);

        console.log(`totalOffset = ${totalOffset}, innerHeightOfWindow = ${innerHeightOfWindow}`);

        //測試用，滾動的距離超過 300，則 scroll() 執行完畢，往下一個 function 繼續執行
        if( totalOffset > 300 ){
            break;
        }
    }
}

async function getUrl(){
    //取得動態產生結果的 html 元素
    let html = await nightmare.evaluate(function() {
        return document.documentElement.innerHTML;
    });
    
    //走訪目前網頁上可見的圖片、影片連結項目
    $(html).find('div.Nnq7C.weEfm div.v1Nh3.KIKUG._bz0w').each(function(index, element){
        $(element).find('a').each(function(idx, elm){
            //取得項目 a 當中 href 屬性的值
            let aLink = $(elm).attr('href');

            console.log(`取得網址: ${aLink}`);

            //將網頁上每個項目的超連結，都放到 arrLink 當中
            arrLink.push('https://www.instagram.com' + aLink);
        });
    });
}

//逐個網頁連結內容進行分析
async function parse(){
    //走訪每個超連結
    for(let aLink of arrLink){
        //走訪頁面
        await nightmare.goto(aLink, headers);

        //取得 ig 連結的 id
        let regex = /\/p\/([a-zA-Z0-9-_]+)\//g;
        let match = regex.exec(aLink);
        let pageId = match[1];
        console.log(`網頁連結: ${aLink}, ID: ${match[1]}`);

        //強制等待
        await nightmare.wait(2000);

        //清空暫時存放 key-value 格式的圖片、影片資訊的物件
        objTmp = {};

        /**
         * 判斷是否有「向右」按鈕，
         * 若有，則代表會有多個 li；
         * 若無，則代表只有一個 li
         */
        if( await nightmare.exists('button._6CZji') ){
            //取得多元素資訊
            await _parseMultipleItems();

            //整合此次網頁連結的元素資訊
            arrData.push({
                "id": pageId,
                "url": aLink,
                "content": objTmp
            });
        } else {
            //取得當下的 html
            let html = await nightmare.evaluate(function() {
                return document.documentElement.innerHTML;
            });

            /**
             * 如果連結中只有單一圖片，則直接取得 article 底下 img.FFVAD 的 src 來儲存
             * 如果連結只只有單一影片，只直接取得 article 底下 video.tWeCl 的 src 來儲存
             */
            if ( await nightmare.exists('article.QBXjJ.M9sTE.L_LMM.JyscU.ePUX4 img.FFVAD') ){
                //取得 img 連結
                let imgSrc = $(html).find('article.QBXjJ.M9sTE.L_LMM.JyscU.ePUX4 img.FFVAD').attr('src');

                //雜湊 img 連結，作為 dict 的 key
                let strKey = await _md5(imgSrc);

                //建立 img 的 key-value
                objTmp[strKey] = imgSrc;
            } else if ( await nightmare.exists('article.QBXjJ.M9sTE.L_LMM.JyscU.ePUX4 video.tWeCl') ) {
                //取得 video 連結
                let videoSrc = $(html).find('article.QBXjJ.M9sTE.L_LMM.JyscU.ePUX4 video.tWeCl').attr('src');
                
                //雜湊 video 連結，作為 dict 的 key
                let strKey = await _md5(videoSrc);
                
                //建立 video 的 key-value
                objTmp[strKey] = videoSrc;
            }

            //新增元素資訊到 arrData
            arrData.push({
                "id": pageId,
                "url": aLink,
                "content": objTmp
            });
        }
    }
}


async function _parseMultipleItems(){

    if( await nightmare.exists('button._6CZji')){
        await nightmare.click('button._6CZji');

        let html = await nightmare.evaluate(function() {
            return document.documentElement.innerHTML;
        });


        $(html).find('li.Ckrof').each(async function(index,element){
            if($(element).find('img.FFVAD').length > 0 ){
                let imgSrc = $(element).find('img.FFVAD').attr('src');

                let strKey = await _md5(imgSrc);
                objTmp[strKey] = imgSrc;
            }
            else if($(element).find('video.tWeCl').length>0){
                let videoSrc = $(element).find('video.tWeCl').attr('src');

                let strKey = await _md5(videoSrc);
                objTmp[strKey]=videoSrc;
            }
        });

        await nightmare.wait(1000);
        await _parseMultipleItems();
    }
}

async function _md5(str){
    return crypto.createHash('md5').update(str).digest('hex');
}

async function asyncArray(functionList){
    for(let func of functionList){
        await func();
    }
}

(
    async function (){
        await asyncArray([
            init,  
            login, 
            visit, 
            scroll, 
            getUrl, 
            parse 
        ]).then(async ()=>{
            console.log('Done');
        });
    }
)();