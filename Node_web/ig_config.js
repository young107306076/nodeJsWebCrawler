const config = {
    username: "yyyj_334",
    password: "young1111"
};

module.exports = config;

// async function getUrl(){
//     //取得動態產生結果的 html 元素
//     let html = await nightmare.evaluate(function() {
//         return document.documentElement.innerHTML;
//     });
    
//     //走訪目前網頁上可見的圖片、影片連結項目
//     $(html).find('div.Nnq7C.weEfm div.v1Nh3.KIKUG._bz0w').each(function(index, element){
//         $(element).find('a').each(function(idx, elm){
//             //取得項目 a 當中 href 屬性的值
//             let aLink = $(elm).attr('href');

//             console.log(`取得網址: ${aLink}`);

//             //將網頁上每個項目的超連結，都放到 arrLink 當中
//             arrLink.push('https://www.instagram.com' + aLink);
//         });
//     });
// }

// async function parse(){
//     for(let aLink of arrLink){

//         await nightmare.goto(aLink, headers);

//         let regex = /\/p\/([a-zA-Z0-9-_]+)\//g;
//         let match = regex.exec(aLink);
//         let pageId = match[1];
//         console.log(`網頁連結: ${aLink}, ID: ${match[1]}`);

//         await nightmare.wait(2000);

//         objTmp = {};

//         if( await nightmare.exists('button._6CZji') ){
//             //取得多元素資訊
//             await _parseMultipleItems();

//             //整合此次網頁連結的元素資訊
//             arrData.push({
//                 "id": pageId,
//                 "url": aLink,
//                 "content": objTmp
//             });
//         } else {
//             //取得當下的 html
//             let html = await nightmare.evaluate(function() {
//                 return document.documentElement.innerHTML;
//             });
//             if ( await nightmare.exists('article.QBXjJ.M9sTE.L_LMM.JyscU.ePUX4 img.FFVAD') ){
//                 //取得 img 連結
//                 let imgSrc = $(html).find('article.QBXjJ.M9sTE.L_LMM.JyscU.ePUX4 img.FFVAD').attr('src');

//                 //雜湊 img 連結，作為 dict 的 key
//                 let strKey = await _md5(imgSrc);

//                 //建立 img 的 key-value
//                 objTmp[strKey] = imgSrc;
//             } else if ( await nightmare.exists('article.QBXjJ.M9sTE.L_LMM.JyscU.ePUX4 video.tWeCl') ) {
//                 //取得 video 連結
//                 let videoSrc = $(html).find('article.QBXjJ.M9sTE.L_LMM.JyscU.ePUX4 video.tWeCl').attr('src');
                
//                 //雜湊 video 連結，作為 dict 的 key
//                 let strKey = await _md5(videoSrc);
                
//                 //建立 video 的 key-value
//                 objTmp[strKey] = videoSrc;
//             }

//             //新增元素資訊到 arrData
//             arrData.push({
//                 "id": pageId,
//                 "url": aLink,
//                 "content": objTmp
//             });
//         }   
//     } 
// }