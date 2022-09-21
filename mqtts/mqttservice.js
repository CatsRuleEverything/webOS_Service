/*
 * Copyright (c) 2020-2022 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// helloworld_webos_service.js
// is simple service, based on low-level luna-bus API

// eslint-disable-next-line import/no-unresolved
const pkgInfo = require('./package.json');
const Service = require('webos-service');
const config = require('./config.json');
const fs = require("fs");

const service = new Service(pkgInfo.name); // Create service by service name on package.json
const logHeader = "[" + pkgInfo.name + "]";

const options = {
    host: config.mqttIP,
    port: 1883
};



//mqtt 초기화
const mqtt = require('mqtt');
console.log("----initial----");

const client = mqtt.connect(options);
client.subscribe('esp/door/open'); //subscribe
client.subscribe('espCam/img')

console.log("----success----");

// mqtt 저장소
var storage = new Map();

client.on('message', function(topic, msg){
    console.log("전달 완료 ||" + topic + " || 상태 : "+msg);
    storage.set(topic, msg);
});

// 현관문 상태 
service.register("getDoorOpen", function(message) {
    try{
        var res = "";
        var key = "esp/door/open";
        console.log(logHeader, "SERVICE_METHOD_CALLED:/getDoorOpen");

        console.log("publish");
        client.publish('esp/door/open/get','1');
        
        setTimeout(function(){
            if(storage.has(key)){
                res = storage.get(key);
            } else res = "error";    
        },1000);


        message.respond({
            returnValue: true,
            Response: res.toString()
        });
    
    }
    catch{
        console.log("error");
    }
  
});


// 배변 패드 사진 가져오기
service.register("getToiletPicture", function(message) {
    try{
        var res = "";
        var key = "espCam/img";
        console.log(logHeader, "SERVICE_METHOD_CALLED:/getToiletPicture");

        console.log("publishCam");
        client.publish('espCam/img/get','1');
        
        setTimeout(function(){
            if(storage.has(key)){
                res = storage.get(key);
                fs.writeFile('../mqttc/static/picture.jpeg', res, err => {
                    if(err){
                        console.error(err);
                        res = false;
                    }
                });
            }
            else res = false;    


            message.respond({
                returnValue: true,
                Response: true
            });
        },1000);
    }
    catch{
        console.log("error");
    }
  
});
