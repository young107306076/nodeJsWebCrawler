const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true, width: 1024, height: 960 });
const fs = require('fs');

//引入 jQuery 機制
const { JSDOM } = require('jsdom');
const { window } = new JSDOM("");
const $ = require('jquery')(window);

//設定 request headers
const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};

//放置網頁元素(物件)
const arrLink = [];

//關鍵字
let strSinger = '張學友';

async function init(){
    if( !fs.existsSync(`downloads/youtube`)){
        fs.mkdirSync(`downloads/youtube`);
    }
}

async function browse(){
    console.log(`準備瀏覽....`);

    await nightmare
    .goto('https://www.momoshop.com.tw/main/Main.jsp', headers)
    .wait(2000)
    .click('button#search-icon-legacy')


}

async function filter(){
    console.log(`操作篩選器`);

    await nightmare
    .click('a.yt-simple-endpoint.style-scope.ytd-toggle-button-renderer')
    .wait(6000)
    .click('ytd-search-filter-group-renderer:nth-of-type(5) ytd-search-filter-renderer:nth-of-type(3)')
    .wait(2000)
    .click('a.yt-simple-endpoint.style-scope.ytd-toggle-button-renderer')
    .wait(6000)
    .click('ytd-search-filter-group-renderer:nth-of-type(3) ytd-search-filter-renderer:nth-of-type(1) a#endpoint')
    .wait(2000)
    .click('a.yt-simple-endpoint.style-scope.ytd-toggle-button-renderer')
    .wait(6000);
}

async function parse(){
    console.log(`分析、整理、收集重要資訊...`);

    let html = await nightmare
    .wait('div#contents.style-scope.ytd-item-section-renderer ytd-video-renderer.style-scope.ytd-item-section-renderer')
    .evaluate(()=>{
        return document.documentElement.innerHTML;
    })

    let regex = null;
    let arrMatch = null;
    let obj = {};

    $(html)
    .find('div#contents.style-scope.ytd-item-section-renderer ytd-video-renderer.style-scope.ytd-item-section-renderer')
    .each((index,element)=>{
        let linkOfImage = $(element).find('img#img.style-scope.yt-img-shadow').attr('src');
        
        regex =  /https:\/\/i\.ytimg\.com\/vi\/([a-zA-Z0-9_]{11})\/hqdefault\.jpg/g;
        if( (arrMatch = regex.exec(linkOfImage))!=null){
            obj.img = arrMatch[0];
            obj.id = arrMatch[1];

            let titleOfVideo = $(element)
            .find('a#video-title.yt-simple-endpoint.style-scope.ytd-video-renderer')
            .text();
            titleOfVideo = titleOfVideo.trim();
            obj.title = titleOfVideo;

            let linkOfVideo = $(element)
            .find('a#video-title.yt-simple-endpoint.style-scope.ytd-video-renderer')
            .attr('href');
            linkOfVideo = 'https://www.youtube.com' + linkOfVideo;
            obj.link = linkOfVideo;

            //歌手名稱
            obj.singer = strSinger;

            //收集、整理各個擷取到的影音連結元素資訊，到全域的陣列變數中
            arrLink.push(obj);

            //變數初始化
            obj = {};

        }
    
    });

}



(
    async function(){
        await asyncArray([
            init,
            browse,
            filter,
            parse
        ]).then(async ()=>{
            console.dir(arrLink, {depth: null});

            await fs.writeFileSync(`downloads/youtube.json`,JSON.stringify(arrLink,null,4));

            console.log('Done');
        })
    }



)();