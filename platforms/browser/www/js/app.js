(function($) {

    var API_URL = 'https://api.quixservice.com/',
        isApp = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/);

    $(function() {        

        Router.add({
            name : 'account',
            templateUrl : 'views/account.html',
            controller : initAccountPage
        }).add({
            name : 'requests',
            templateUrl : 'views/accountRequests.html',
            controller : initAccountRequests
        }).add({
            name : 'requestDetail',
            templateUrl : 'views/request-detail.html',
            controller : initRequestDetail
        }).add({
            name : 'request',
            templateUrl : 'views/request.html',
            controller : initRequstPage
        }).add({
            name : 'orderComplete',
            templateUrl : 'views/order-complete.html',
            controller : initOrderComplete
        }).add({
            name : 'login',
            templateUrl : 'views/login.html',
            controller : initLoginPage
        }).add({
            name : 'signup',
            templateUrl : 'views/signup.html',
            controller : initSignupPage
        }).add({
            name : 'signupSuccess',
            templateUrl : 'views/signup-success.html',
            controller : initSignupSuccessPage
        }).add({
            name : 'about',
            templateUrl : 'views/about.html',
            controller : hideLoader
        }).add({
            name : 'services',
            templateUrl : 'views/services.html',
            controller : hideLoader
        }).add({
            name : 'faq',
            templateUrl : 'views/faq.html',
            controller : hideLoader
        }).add({
            name : 'contact',
            templateUrl : 'views/contact.html',
            controller : hideLoader
        }).init();
        

        initApp();


    }); // end of document ready

    function initApp(){

        window.startLoader = showLoader;
        window.stopLoader = hideLoader;

        $('.button-collapse').sideNav();
        displayLoggedInUser();        

        $(document)
            .on('file', '.file', function(e, data){

                $(this).val(data.path).addClass('has-value required').change();

            })
            .on('file', '.file:not(.has-value)', function(e, data){

                var totalFiles = $('.files .file').length,
                    fileId = 'file' + ( totalFiles + 1 );

                $('.files').append('<div class="col s12"><input class="file" id="'+ fileId +'" name="'+ fileId +'" type="text"></div>');
                $('#' + fileId).uploader({
                    label : '<i class="material-icons">add</i>',
                    accept : 'image/*'
                });
                $('.ev-uploader input').attr('capture', 'camera');

            })
            .on('click', '[route-to]', function(){

                $('.button-collapse').sideNav('hide');

            })
            .on('keyup change input', '.app-page input:not(.file), .app-page textarea', enableNextButton)
            .on('click', '[data-slide]', slidePage)
            .on('click', '.review-request', showConfirmRequest)
            .on('click', '.send-request', sendRequst)
            .on('change', '#useContactPerson', function(){

                $('.contact-person').toggle();

            })
            .on('click', '.login', login)
            .on('click', '.signup', signup)
            .on('click', '.account-save', saveAccount)
            .on('click', '.reset-password', resetPassword)
            .on('change', '#date', function(){

                setupTime();

            });

    }

    // init login page
    function initLoginPage(){

        var params = Router.getParams() || {};
        
        if(params.request){
            $('.login-header').html('Pease Login To Add Request #'+ params.request.requestNumber +' To Your Account');
       
            $('#login_email').val(params.request.email);
            //Router.setParams({});
        }

        hideLoader();

    }

    // init signup page
    function initSignupPage(){

        var params = Router.getParams() || {};
        
        if(params.request){
            $('#signup_name').val(params.request.name);
            $('#signup_email').val(params.request.email);
            $('#signup_phone').val(params.request.phone);

            $('.signup-header').html('Creat An Account To Add Request #'+ params.request.requestNumber +' To Your Account');
            //Router.setParams({});
        }

        hideLoader();

    }

    // init signup success
    function initSignupSuccessPage(){

    	var params = Router.getParams() || {};
    	
    	if(params.request){
    		$('.signup-success .next').attr('route-to', 'requests').html('View Your Requests');
    	}

    	$('.signup-success .title').html('Welcome ' + getUser().name.split(' ')[0]);     

        hideLoader();
    }

    // init request route
    function initRequstPage(){               

        if(typeof Uploader !== 'undefined'){
            $('.file').uploader({
                label : '<i class="material-icons">camera_alt</i><br>Upload a picture of the issue.',
                //accept : 'image/*;capture=camera'
                accept : 'image/*'
            })
            $('.ev-uploader input').attr('capture', 'camera');
        }

        
            $('.datepicker').attr('min', new Date().getFullYear() +'-'+ ("0" + (new Date().getMonth() + 1)).slice(-2) +'-'+ ("0" + new Date().getDate()).slice(-2) );
                

        if (!isApp) {
            $('.datepicker').pickadate({
                min: true
            });
            $('#date_root').appendTo('body');
        }

        if(document.getElementById('address')){
            if(typeof google === 'undefined'){
                $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyDIaszVrabk86d_NTTJkHQlhshQ1gkLjmc&libraries=places', function(){
                    new google.maps.places.Autocomplete(document.getElementById('address'), {});
                });
            }else{
                new google.maps.places.Autocomplete(document.getElementById('address'), {});
            }
        }

        setupTime();

        $('#name').val(getUser().name).change();
        $('#email').val(getUser().email).change();
        $('#phone').val(getUser().phone).change();

        hideLoader(); 

    }

    // init order complete page
    function initOrderComplete(){
        var params = Router.getParams();
        $('.order-number').html('Your order number is <strong class="text-black">' + params.request.requestNumber + '</strong>');
        if(!getUser().userToken){

            if(params.request.userInSystem){
                $('.set-up-account .white-button').text('Add #'+params.request.requestNumber+' to your account').attr('route-to','login');
            }else{
                $('.set-up-account .white-button').attr('route-to','signup');
            }
            $('.set-up-account .hidden').show();

        }

        hideLoader();
    }

    // init account route
    function initAccountPage(){

        if(!getUser().userToken){
            return Router.go('login');
        }

        $.ajax({
            url: API_URL + 'users/' + getUser().userToken,
            type: "GET",
            beforeSend: function(xhr){
                xhr.setRequestHeader('token', getUser().userToken);
            },
            success: function(account) {
                account = JSON.parse(account);
                $('#account_name').val(account.name);
                $('#account_email').val(account.email);
                $('#account_phone').val(account.phone);
                hideLoader();
            }
        });

    }

    //init account requests
    function initAccountRequests(){

        var AVAILABLE_STATUS = {            
            '0': 'Confirmed',            
            '1': 'In progress',
            '2': 'Completed',            
            '3': 'Customer unresponsive',                    
            '4': 'Archived',
        };

        if(!getUser().userToken){
            return Router.go('login');
        }

        $.ajax({
            url: API_URL + 'requests/' + getUser().userToken,
            type: "GET",
            beforeSend: function(xhr){
                xhr.setRequestHeader('token', getUser().userToken);
            },
            success: function(requests) {
                requests = JSON.parse(requests);
                if(requests.length){
                    requests = requests.map(function(request){
                        return '<div class="account-request" route-to="requestDetail" route-params=\'{\"requestToken\":\"'+ request.requestToken +'\"}\'><div><span>#'+ request.requestNumber + '</span> - </span>' + getDateFromTimestamp(request.serviceDate) + '</span> - </span>' + AVAILABLE_STATUS[request.status] +'</span></div><i class="material-icons cyan-text text-lighten-2">remove_red_eye</i></div><div class="account-request-devider cyan lighten-2"></div>';
                    });
                    $('.account-requests').html(requests);
                }else{

                }
                hideLoader();
            }
        });
    }

    function initRequestDetail(){
        var requestToken = Router.getParams().requestToken;
        $.ajax({
            url: API_URL + 'requests/' + requestToken,
            type: "GET",
            beforeSend: function(xhr){
                xhr.setRequestHeader('token', getUser().userToken);
            },
            success: function(requests) {
                var preview = '',
                files,
                container = $('.request-detail');

                request = JSON.parse(requests)[0];                
                request.files = JSON.parse(request.files) || [];

                $('.request-number').html(request.requestNumber);

                if(request.description){
                    preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Description</em><br/>'+ request.description +'</div>';
                }

                if(request.files.length){
                    preview += '<div class="row file-preview-container">';
                     
                        files = request.files.map(function(file){
                            return '<div class="col s6"><input value="'+ file.replace(/.pdf|.PDF/,'.png') +'" disabled class="file-preview"/></div>';
                        });

                        preview += files.join('');

                    preview += '</div>';
                }


                preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Address</em><br/>'+ request.location +'<br/></div>';


                preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Date</em><br/>'+ getDateFromTimestamp(request.serviceDate) +'<br/></div>';
                preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Time</em><br/>'+ getTimeFromTimestamp(request.serviceDate) +'<br/></div>';


                preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Name</em><br/>'+ request.name +'<br/></div>';
                preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Email</em><br/>'+ request.email +'<br/></div>';
                preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Phone</em><br/>'+ request.phone +'<br/></div>';

                if(request.name2 || request.phone2){


                    preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Contact Name</em><br/>'+ request.name2 +'<br/></div>';
                    preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Contact Phone</em><br/>'+ request.phone2 +'<br/></div>';

                }

                container.html(preview);
                $('.file-preview').each(function(){
                	$(this).uploader();
                });
                hideLoader();
            }
        });
    }

    // init add request to account
    function initAddRequestToAccount(){
        var request = JSON.parse(localStorage.getItem('QUIX_LAST_REQUEST')); 
        $('#login_email').val(request.email);

        $('#signup_name').val(request.name);
        $('#signup_email').val(request.email);
        $('#signup_phone').val(request.phone);

        $('.login-header').html('Pease Login To Add Request #'+ request.requestNumber +' To Your Account');
        $('.signup-header').html('Creat An Account To Add Request #'+ request.requestNumber +' To Your Account');

        if(!request.userInSystem){
            slide(1);
        }

        hideLoader();
    }

    //setup time dropdown based on date selected
    function setupTime(){

        var hours = {
                "00:00" : "12:00 AM",
                "01:00" : "01:00 AM",
                "02:00" : "02:00 AM",
                "03:00" : "03:00 AM",
                "04:00" : "04:00 AM",
                "05:00" : "05:00 AM",
                "06:00" : "06:00 AM",
                "07:00" : "07:00 AM",
                "08:00" : "08:00 AM",
                "09:00" : "09:00 AM",
                "10:00" : "10:00 AM",
                "11:00" : "11:00 AM",
                "12:00" : "12:00 PM",
                "13:00" : "01:00 PM",
                "14:00" : "02:00 PM",
                "15:00" : "03:00 PM",
                "16:00" : "04:00 PM",
                "17:00" : "05:00 PM",
                "18:00" : "06:00 PM",
                "19:00" : "07:00 PM",
                "20:00" : "08:00 PM",
                "21:00" : "09:00 PM",
                "22:00" : "10:00 PM",
                "23:00" : "11:00 PM"
            },
            today = new Date(),
            date = new Date($('#date').val() || Date.now()),
            selectedTime = $('#time').val();

        $('#time').html('');

        if(today.toLocaleDateString() == date.toLocaleDateString()){
            date = new Date(Date.now());
        }


        for(var h in hours){
            if(parseFloat(h) > date.getHours()){
                $('#time').append('<option value="'+ h +'">'+ hours[h] +'</option>');
            }                
        } 

        if(!validateServiceDate()){
            Materialize.toast('<div class="red-text">Please Choose a Later Date!</div>', 4000);
        }

        if($('#time option[value="'+ selectedTime +'"]').length){
            $('#time').val(selectedTime).change();
        }

        $('#time').material_select();

    }

    function validateServiceDate(){
        if($('#date').val() && getEpoch($('#date').val().replace(/-/g, '/') + ' ' + $('#time').val()) <= getEpoch(Date.now())){
            return false;
        }else{
            return true;
        }
    }

    // show request before sending to server 
    function showConfirmRequest(){
        var container = $('.request-breakdown'),
            preview = '';

        if($('#description').val()){
            preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Description</em><br/>'+ $('#description').val() +'</div>';
        }

        if($('.file.has-value').length){
            preview += '<div class="row file-preview-container">';

                $('.file.has-value').each(function(){
                    preview += '<div class="col s6"><input value="'+ $(this).val().replace(/.pdf|.PDF/,'.png') +'" disabled class="file-preview" /></div>';
                });

            preview += '</div>';
        }


        preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Address</em><br/>'+ $('#address').val() +'<br/></div>';


        preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Date</em><br/>'+ $('#date').val() +'<br/></div>';
        preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Time</em><br/>'+ $('#time option:selected').text() +'<br/></div>';


        preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Name</em><br/>'+ $('#name').val() +'<br/></div>';
        preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Email</em><br/>'+ $('#email').val() +'<br/></div>';
        preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Phone</em><br/>'+ $('#phone').val() +'<br/></div>';

        if($('#useContactPerson').is(':checked')){


            preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Contact Name</em><br/>'+ $('#contactName').val() +'<br/></div>';
            preview += '<div class="preview-block"><em class="cyan-text text-lighten-2">Contact Phone</em><br/>'+ $('#contactPhone').val() +'<br/></div>';

        }

        container.html(preview);

        $('.file-preview').each(function(){
        	$(this).uploader();
        });

        return false;
    }


    //enable next button if page is valid
    function enableNextButton(){

        var page = $(this).closest('.app-page'),
            next = page.find('.next'),
            emailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/,
            isValid = true;

        page.find('input.required:not(.file), textarea.required').each(function(){

            if(!$(this).val()){
                isValid = false;
            }else if( $(this).attr('type') === 'email' && !emailRegex.test($(this).val()) ){
                isValid = false;
            }else if( $(this).attr('type') === 'date'){
                isValid = validateServiceDate();
            }

        });

        if(isValid){
            next.removeClass('disabled');
        }else{
            next.addClass('disabled');
        }        

    }

    // send request to server
    function sendRequst(){

        var files = [];

        if($('.next.disabled').length){
            return;
        }

        showLoader();

        $('.file.has-value').each(function(){
            files.push($(this).val());
        });

        $.post(API_URL + 'requests', JSON.stringify({
            location : $('#address').val(),
            description : $('#description').val(),
            serviceDate : getEpoch($('#date').val().replace(/-/g, '/') + ' ' + $('#time').val()),
            name : $('#name').val(),
            email : $('#email').val(),
            phone : $('#phone').val(),
            name2 : $('#contactName').val(),
            phone2 : $('#contactPhone').val(),
            files : files,
            userToken : getUser().userToken,
            requestedVia : navigator.userAgent.toLowerCase()
        })).done(function(data) {
            data = JSON.parse(data);

            Router.go('orderComplete', JSON.stringify({
                request :data
            }));

        }).fail(function(data) {
            hideLoader();
            Materialize.toast('<div class="red-text">Request Failed Try Again Later</div>', 8000);
        });
    }

    function addRequestToAccount(redirect){  

        var request = Router.getParams().request; 
        $.post(API_URL + 'requests/' + request.requestToken + '/' + getUser().userToken).done(function(data) {
                    
            Router.go(redirect);

        }).fail(function(data) {
            hideLoader();
            Materialize.toast('<div class="red-text">Error!</div>', 4000);
        });

    }

    // send login request
    function login(){

        showLoader();
        $.post(API_URL + 'login', JSON.stringify({
            email : $('#login_email').val(),
            password : $('#login_password').val()
        })).done(function(data) {
            data = JSON.parse(data);
            if(data.userToken){
                setUser(data);

                if(Router.getParams().request){
                    addRequestToAccount('requests');
                }else{
                    Router.go('requests');
                }

            }else{
                if(data.error){
                    $('.login-error-message').text(data.error);
                }
                hideLoader();
            }
        }).fail(function(data) {
            hideLoader();
            Materialize.toast('<div class="red-text">Error!</div>', 4000);
        });

    }

    // send signup request
    function signup(){

        if($('#signup_password').val() !== $('#signup_password2').val()){
            return $('.signup-error-message').text('Password not a match');
        }

        showLoader();
        $.post(API_URL + 'signup', JSON.stringify({
            name : $('#signup_name').val(),
            email : $('#signup_email').val(),
            phone : $('#signup_phone').val(),
            password : $('#signup_password').val()
        })).done(function(data) {
            data = JSON.parse(data);
            if(data.userToken){
                setUser(data);
                if(Router.getParams().request){
                    addRequestToAccount('signupSuccess');
                }else{
                    Router.go('signupSuccess');
                }
            }else{
                if(data.error){
                    $('.signup-error-message').text(data.error);
                }
                hideLoader();
            }
        }).fail(function(data) {
            hideLoader();
            Materialize.toast('<div class="red-text">Error!</div>', 4000);
        });

    }

    // update account
    function saveAccount(){

        var userToken = getUser().userToken,
            account = {
            userToken : userToken,
            name : $('#account_name').val(),
            email : $('#account_email').val(),
            phone : $('#account_phone').val()
        };

        showLoader();
        $.post(API_URL + 'users/' + userToken, JSON.stringify(account)).done(function(data) {
            hideLoader();
            data = JSON.parse(data);
            if(data.error){
                $('.account-page .signup-error-message, .account-page .account-error-message').text(data.error);
            }else{
                $('.account-page .account-success-message').text('Account Updated!');
                setUser(data);
            }
        }).fail(function(data) {
            hideLoader();
            Materialize.toast('<div class="red-text">Error!</div>', 4000);
        });
    }

    //reset password
    function resetPassword(){

        if($('#account_password_new').val() !== $('#account_password2_new').val()){
            return $('.account-error-message').text('Password not a match');
        }

        showLoader();
        $.post(API_URL + 'password', JSON.stringify({
          "userToken" : getUser().userToken,
          "origPassword" : $('#account_password').val(),
          "password" : $('#account_password_new').val(),
          "password2" : $('#account_password2_new').val()
        })).done(function(data) {
            hideLoader();
            data = JSON.parse(data);
            if(data.error){
                $('.reset-password-page .account-error-message').text(data.error);
            }else{
                slide(0);
                $('.account-page .account-success-message').text('Password Updated!');
                
            }
        }).fail(function(data) {
            hideLoader();
            Materialize.toast('<div class="red-text">Error!</div>', 4000);
        });

    }

    // slide to new page and scroll up
    function slidePage(){

        var left = $(this).data('slide');

        slide(left);
        setTimeout(function(){
            $('.app-page').scrollTop(0);            
        }, 500);

        return false;

    }

    // slide left times window width
    function slide(left){

        $('.app-inner').css('transform', 'translateX(-' + ( $(window).width() * left ) + 'px)');

    }

    // fade in loader and start spining
    function showLoader(){

        $('.loader').addClass('loading').fadeIn(300);

    }

    //fade out loader and stop spining
    function hideLoader(){

        setTimeout(function(){
            $('.loader').removeClass('loading').delay(1200).fadeOut(300);
        }, 1200);

    }

    //save user local
    function setUser(user){

        localStorage.setItem('QUIX_USER', JSON.stringify(user));    
        displayLoggedInUser();    

    }

    //get user from local storage
    function getUser(){

        return JSON.parse(localStorage.getItem('QUIX_USER')) || {};

    }

    //display users email in left nav
    function displayLoggedInUser(){
    	$('.user-email').html(getUser().email).toggleClass('hidden', !getUser().email);
    }

    // convert GMT date to local date
    function epochToLocal(epoch){

        var d = new Date(0);
        return d.setUTCSeconds(epoch);

    }

    // get the current GMT date
    function getEpoch(timestamp){

        return Math.round(new Date(timestamp).getTime()/1000.0);

    }

    function getDateFromTimestamp(timestamp){
        return new Date( epochToLocal( Number( timestamp ) ) ).toLocaleDateString();
    }

    function getTimeFromTimestamp(timestamp){
        return new Date( epochToLocal( Number( timestamp ) ) ).toLocaleTimeString();
    }

})(jQuery); // end of jQuery name space
