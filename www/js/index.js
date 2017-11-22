/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        //Materialize.toast('PushNotification ' + typeof PushNotification, 4000);
        if(typeof PushNotification !== 'undefined'){
            var push = PushNotification.init({
                android : {
                    senderID : "767712014853"
                },
                ios : {
                    senderID : "767712014853",
                    sound: true,
                    vibration: true,
                    badge: true
                }
            });

            push.on('registration', function(data){
                //Materialize.toast('ID: ' + data.registrationId, 60000);
                //Materialize.toast('subscribe ' + typeof push.subscribe, 4000);
                push.subscribe('all', function(success){
                    //Materialize.toast('Subscribed ' + success, 40000);
                }, function(error){
                    Materialize.toast('Error ' + error, 40000);
                });
            });

            push.on('error', function(error){
                Materialize.toast('Error ' + error, 4000);
            });

            push.on('notification', function(data){
                Materialize.toast('ALERT!!!', 4000);
                navigator.notification.alert(data.message, null, data.title);
            });
        }else{
            //Materialize.toast('Error PushNotification undefined', 1000);
        }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {

        $('.loader').addClass('init_loading').addClass('loading').fadeIn(300);
        setTimeout(function(){
            $('.loader').fadeOut(300).removeClass('init_loading').removeClass('loading');
            if(navigator.splashscreen){
                navigator.splashscreen.hide();
            }
        }, 3000);

        console.log('Received Event: ' + id);
    }
};
