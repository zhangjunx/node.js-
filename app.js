//superagent 是一个轻量级、渐进式的请求库，内部依赖 nodejs 原生的请求 api,适用于 nodejs 环境。
//cheerio 是 nodejs 的抓取页面模块，为服务器特别定制的，快速、灵活、实施的 jQuery 核心实现。适合各种 Web 爬虫程序。node.js 版的 jQuery。
const cheerio = require("cheerio");
const superagent = require("superagent");
const fs = require("fs");

const weiboURL = "https://s.weibo.com";
const hotSearchURL = weiboURL + "/top/summary?cate=realtimehot";

//使用 superagent 发送get请求
// superagent 的 get 方法接收两个参数。第一个是请求的 url 地址，第二个是请求成功后的回调函数。
// 回调函数有俩参数，第一个参数为 error ，如果请求成功，则返回 null，反之则抛出错误。第二个参数是请求成功后的 响应体
superagent.get(hotSearchURL, (err, res) => {
    if (err) {
        console.error(err)
    }
    // 在 nodejs 中，要想向上面那样愉快的写 jQuery 语法，还得将请求成功后返回的响应体，用 cheerio 的 load 方法进行包装。
    const $ = cheerio.load(res.text);
    //使用 jQuery 的 each 方法，对 tbody 中的每一项 tr 进行遍历，回调参数中第一个参数为遍历的下标 index，第二个参数为当前遍历的元素，一般 $(this) 指向的就是当前遍历的元素。
    let hotList = [];
    $("#pl_top_realtimehot table tbody tr").each(function(index) {
            if (index != 0) {
                const $td = $(this).children().eq(1);
                const link = weiboURL + $td.find("a").attr("href");
                const text = $td.find("a").text();
                const hotValue = $td.find("span").text();
                const icon = $td.find("img").attr("src") ? "https:" + $td.find("img").attr("src") : "";
                hotList.push({
                    index,
                    link,
                    text,
                    hotValue,
                    icon
                })
            }
        })
        //接着使用 nodejs 的 fs 模块，将创建好的数组转成 json字符串，最后写入当前文件目录下的 hotSearch.json 文件中（无此文件则会自动创建）。
    fs.writeFileSync(
        `${__dirname}/hotSearch.json`,
        JSON.stringify(hotList),
        "utf-8"
    )
})