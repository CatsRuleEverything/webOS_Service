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


const service = new Service(pkgInfo.name); // Create service by service name on package.json
const logHeader = "[" + pkgInfo.name + "]";

const options = {
    host: 'broker.hivemq.com',
    port: 1883
};



//mqtt 초기화
const mqtt = require('mqtt');
console.log("----initial----");
const client = mqtt.connect(options);
client.subscribe('esp/door/open');
console.log("----success----");

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
        client.publish('esp/door/open/get');
        
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
