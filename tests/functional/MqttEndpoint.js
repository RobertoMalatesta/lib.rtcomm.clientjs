/**
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
define([
    'intern',
    'intern!object',
    'intern/chai!assert',
    (typeof window === 'undefined' && global)
      ?'intern/dojo/node!../support/mqttws31_shim':
        'bower_components/bower-mqttws/mqttws31',
    'support/config',
    'bower_components/webrtc-adapter/adapter',
    'umd/rtcomm/EndpointProvider',
    'support/rtcommFatUtils'

], function (intern, registerSuite, assert, globals,config, adapter, EndpointProvider, Fat) {
    var suiteName = Fat.createSuiteName("FVT: MqttEndpoint");
    var DEBUG = (intern.args.DEBUG === 'true')? true: false;
 /*   if (typeof window === 'undefined' && global) {
      require(['intern/dojo/node!./tests_intern/mock/mqttws31_shim'], function(globals) {
        console.log('********** Paho should now be defined **********');
     });
    } else {
      require(['lib/mqttws31'], function(globals) {
       console.log('Paho? ', Paho);
       console.log('********** Paho should now be defined **********');
     });
    } */
    var cfg = config.clientConfig1();
    var ep = null;
    var mq1 = null;
    var mq2 = null;
    var globals = null;

    var mqttPublish = function(topic, message, ms) {
      // publish 'message' from mq1 to mq2 on topic
      // pass means we expect it to work or not.
      ms = ms || 1000;
      var p = new Promise(
        function(resolve, reject) {
          var msgrecv1 = null;
          var msgrecv2 = null;
          // Wait to publish 
          mq1.clearEventListeners();
          setTimeout(function() {
            mq1.on('message', function(msg) {
              console.log('MQ1 Received Message: '+msg.content);
              // Should not receive message;
              resolve(false);
            });
            mq2.on('message', function(msg) {
              console.log('MQ2 Received Message: '+msg.content);
              if (msg.content === message) { 
                // Should not receive message;
                resolve(true);
              } else {
                console.log('Received Weird Message:' + msg.content);
                resolve(false);
              }
            });
            mq1.publish(topic, message);
          }, ms);
          setTimeout(function() {
            resolve(false);
          },ms+1000);
      });
      return p;
    };

    registerSuite({
        name: suiteName,
        setup: function() {
          console.log('************* SETUP: '+this.name+' **************');
          var p = new Promise(
            function(resolve, reject) {
              Fat.createProvider(cfg, 'mqttEndpoint').then(
                function(endpointProvider) {
                  console.log('*** Creating MqttEndpoints ***');
                  ep = endpointProvider;
                  mq1 = ep.getMqttEndpoint();
                  mq2 = ep.getMqttEndpoint();
                  mq1.subscribe('/test1');
                  mq2.subscribe('/test2/#');
                  console.log('*** mq1 ***', mq1);
                  resolve();
              });
            });
          return p;
        },
        teardown: function() {
          console.log('************* TEARDOWN: '+this.name+' **************');
          ep.destroy();
          ep = null;
        },
        'mqtt /test2 topic':function() {
          console.log('************* '+this.name+' **************');
          var dfd = this.async(3000);
          mqttPublish('/test2', '1 - Hello from 1').then(
             dfd.callback(function(pass) {
                assert.isTrue(pass,'messsage was received');
              })
           );
        },
        'mqtt /test3 topic':function() {
          console.log('************* '+this.name+' **************');
          var dfd = this.async(3000);
          mqttPublish('/test3', '2 - Hello from 1').then(
             dfd.callback(function(pass) {
                assert.isFalse(pass,'Message should not be received');
              })
           );
        },
        'mqtt /test2/something topic':function() {
          console.log('************* '+this.name+' **************');
          var dfd = this.async(3000);
          mqttPublish('/test2/something', '3 - Hello from 1').then(
             dfd.callback(function(pass) {
                assert.isTrue(pass,'Message should be received');
              })
           );
        },
        'mqtt /test2something topic':function() {
          console.log('************* '+this.name+' **************');
          var dfd = this.async(3000);
          mqttPublish('/test2something', '4 - Hello from 1').then(
             dfd.callback(function(pass) {
                assert.isFalse(pass,'Message should not be received');
              })
           );
        },
        'mqtt /test2something -> /test2 topic':function() {
          console.log('************* '+this.name+' **************');
          var dfd = this.async(3000);
          // Overwrite the mq2 stuff (clean out, start over);
          mq2 = null;
          mq2 = ep.getMqttEndpoint();
          mq2.subscribe('/test2');
          mqttPublish('/test2something', '5 - Hello from 1').then(
             dfd.callback(function(pass) {
                assert.isFalse(pass,'Message should not be received');
              })
           );
        },
        
        'mqtt /test2/something -> /test2 topic':function() {
          console.log('************* '+this.name+' **************');
          var dfd = this.async(3000);
          // Overwrite the mq2 stuff (clean out, start over);
          mq2 = null;
          mq2 = ep.getMqttEndpoint();
          mq2.subscribe('/test2');
          mqttPublish('/test2/something', '6 - Hello from 1').then(
             dfd.callback(function(pass) {
                assert.isFalse(pass,'Message should not be received');
              })
           );
        }
    });
});
