var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var EventEmitter = require('events').EventEmitter;
var myEvents = new EventEmitter();
var schedule = require('node-schedule');
var crawlerTask = require("../crawler/crawlerTask.js");
var rule = new schedule.RecurrenceRule();
var times = [];
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});
var isRuning = false;
router.get('/start', function (req, res, next) {
    if (isRuning) {
        res.render('index', {title: '有一个任务在进行中'});
    } else {
        isRuning = true;
        res.render('index', {title: '爬虫开始了...'});
        sub();
    }

});
myEvents.on('start', function () {
    rule.second = times;
    for (var i = 0; i < 60; i = i + 5) {
        times.push(i);
    }
    schedule.scheduleJob(rule, function () {
        if (crawlerTask.getMainData()) {
            this.cancel();
            console.log('-----------------爬完了-------------------');
            myEvents.emit('updateOther');
        }
    });
});
myEvents.on('updateOther',function () {
    rule.second = times;
    for (var i = 0; i < 60; i = i + 10) {
        times.push(i);
    }
    schedule.scheduleJob(rule, function () {
        if (crawlerTask.updateTagsAndfans()) {
            this.cancel();
            console.log('-----------------更新完了-------------------');
            isRuning = false;
        }
    });
});

// router.get('/bbbb', function (req, res, next) {
//     crawlerTask.updateTagsAndfans();
//     return res.render('index', {title: '更新tag'});
//
// });
var mypretime = 0;
function sub() {
    var Today = new Date();
    var NowHour = Today.getHours();
    var NowMinute = Today.getMinutes();
    var NowSecond = Today.getSeconds();
    var mysec = (NowHour * 3600) + (NowMinute * 60) + NowSecond;
    if ((mysec - mypretime) > 10) {
//10只是一个时间值，就是10秒内禁止重复提交，值随便设
        mypretime = mysec;
    } else {
        return;
    }
    myEvents.emit('start');
}
module.exports = router;
