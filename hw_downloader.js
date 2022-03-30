const util = require('util');
const fs = require('fs');
const exec = util.promisify( require('child_process').exec );

(
    async function () {
        let strJson = await fs.readFileSync('downloads/jinyong.json', { encoding: 'utf-8' });
        let arr = JSON.parse(strJson);

        //若沒資料夾，則直接建立
        //(註: existsSync、mkdirSync 與 exists、mkdir 的差異，在於有 sync 的函式，不需要 callback)
        if (! await fs.existsSync(`downloads/jinyong`) ){ 
            await fs.mkdirSync(`downloads/jinyong`, {recursive: true}); //遞迴建立資料夾
        }

        for(let i = 0; i < arr.length; i++){
            console.log(arr[i]);
            await exec(`curl -k -X GET ${arr[i]} -o "downloads/jinyong/${i}.png" `);
        }
    }
)();