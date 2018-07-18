const cheerio = require('cheerio')
const request = require('superagent');
const fs = require('fs')
const async = require('async')

require('superagent-proxy')(request);

function tumblr(name, cookie) {
    const url = `https://${name}.tumblr.com/archive/filter-by/video`
    const proxy = 'http://127.0.0.1:1080'
    const video = []
    let page = 1
    let all = function fn(url, cookie, proxy, video) {
        request
            .get(url)
            .proxy(proxy)
            .set('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
            .set('accept-language', 'zh-CN,zh;q=0.9')
            .set('cache-control', 'max-age=0')
            .set('cookie', cookie)
            .set('upgrade-insecure-requests', '1')
            .set('user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36')
            .end((err, res) => {
                if (err) {
                    console.log(err)
                }
                let $ = cheerio.load(res.text, { decodeEntities: false })
                $('.post .post_content_inner .has_imageurl').each((index, item) => {
                    let ele = $(item)
                    let src = ele.attr('data-imageurl')
                    let srcSlice = src.slice(src.indexOf('/tumblr'), src.indexOf('_frame1'))
                    let videoSrc = `https://vtt.tumblr.com${srcSlice}.mp4\r\n`
                    video.push(videoSrc)
                })
                let next = $('#next_page_link').attr('href')
                console.log(`已获得第${page}页video`)
                    ++page
                if ($('#no_posts_yet').length > 0) {
                    console.log('已获得全部video')
                    console.log(`共${video.length}条`)
                    for (let i = 0; i < video.length; i++) {
                        fs.appendFileSync(`tumblr_${name}.txt`, video[i])
                    }
                    console.log("已创建文件")
                    return
                }
                all(`https://${name}.tumblr.com${next}`, cookie, proxy, video)
            })
    }
    all(url, cookie, proxy, video)
}
//tumblr()