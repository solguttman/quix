(function($) {

    var USER_TOKEN = localStorage.getItem('QUIX_USER_TOKEN');

    $(function() {

        loadRequestPage();

        initApp();


    }); // end of document ready

    function initApp(){

        window.startLoader = showLoader;
        window.stopLoader = hideLoader;

        showLoader();

        $('.button-collapse').sideNav();

        $(document).on('file', '.file', function(e, data){

            $(this).val(data.path).addClass('has-value required').change();

        }).on('file', '.file:not(.has-value)', function(e, data){

            var totalFiles = $('.files .file').length,
                fileId = 'file' + ( totalFiles + 1 );

            $('.files').append('<div class="col s12"><input class="file" id="'+ fileId +'" name="'+ fileId +'" type="text"></div>');
            $('#' + fileId).uploader({
                label : '<i class="material-icons">add</i>'
            });

        }).on('click', '#nav-mobile li', function(){

            var page = $(this).data('page');
            if(page === 'request'){
                loadRequestPage();
            }

            if(page === 'account'){
                loadAccountPage();
            }

            if(page === 'call'){

            }

        });

        $(document)
            .on('keyup change input', '.app-page input:not(.file), .app-page textarea', enableNextButton)
            .on('click', '[data-slide]', slidePage)
            .on('click', '.review-request', showRequest)
            .on('click', '.send-request', sendRequst)
            .on('change', '#useContactPerson', toggleContactPerson)
            .on('click', '.login', login)
            .on('click', '.signup', signup);
    }

    function initLoginPage(){
        hideLoader();
    }

    function loadLoginPage(){
        showLoader();
        $('.button-collapse').sideNav('hide');
        $('.app').load('views/login.html', function(){
            initLoginPage();
        });
    }

    function loadRequestPage(){
        showLoader();
        $('.button-collapse').sideNav('hide');
        $('.app').load('views/request.html', function(){
            initRequstPage();
        });
    }

    function loadAccountPage(){
        showLoader();

        if(USER_TOKEN){
            $('.button-collapse').sideNav('hide');
            $('.app').load('views/account.html', function(){
                initAccountPage();
            });
        }else{
            loadLoginPage();
        }

    }

    function initRequstPage(){
        hideLoader();
        $('select').material_select();

        if (!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
            $('.datepicker').pickadate({
                min: true
            });
            $('#date_root').appendTo('body');
        }

        if(typeof 'Uplader' !== 'undefined'){
            $('.file').uploader({
                label : '<i class="material-icons">camera_alt</i><br>Upload a picture of the issue.'
            });
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
    }

    function initAccountPage(){
        $.ajax({
            url: 'https://qapi.evelthost.com/requests/' + USER_TOKEN,
            type: "GET",
            beforeSend: function(xhr){xhr.setRequestHeader('token', USER_TOKEN);},
            success: function() {
                hideLoader();
            }
        });
    }

    function showRequest(){
        var container = $('.request-breakdown'),
            preview = '';

        if($('#description').val()){
            preview += '<div class="preview-block"><strong>Description</strong><br/>'+ $('#description').val() +'</div>';
        }

        if($('.file.has-value').length){
            preview += '<div class="row file-preview-container">';

                $('.file.has-value').each(function(){
                    preview += '<div class="col s6"><div class="file-preview" style="background-image:url('+ Uploader.domain + $(this).val() +')"></div></div>';
                });

            preview += '</div>';
        }


        preview += '<div class="preview-block"><strong>Address</strong><br/>'+ $('#address').val() +'<br/></div>';


        preview += '<div class="preview-block"><strong>Date</strong><br/>'+ $('#date').val() +'<br/></div>';
        preview += '<div class="preview-block"><strong>Time</strong><br/>'+ $('#time').val() +'<br/></div>';


        preview += '<div class="preview-block"><strong>Name</strong><br/>'+ $('#name').val() +'<br/></div>';
        preview += '<div class="preview-block"><strong>Email</strong><br/>'+ $('#email').val() +'<br/></div>';
        preview += '<div class="preview-block"><strong>Phone</strong><br/>'+ $('#phone').val() +'<br/></div>';

        if($('#useContactPerson').is(':checked')){


            preview += '<div class="preview-block"><strong>Contact Name</strong><br/>'+ $('#contactName').val() +'<br/></div>';
            preview += '<div class="preview-block"><strong>Contact Phone</strong><br/>'+ $('#contactPhone').val() +'<br/></div>';

        }

        container.html(preview);

        return false;
    }

    function sendRequst(){
        var files = [];

        showLoader();

        $('.file.has-value').each(function(){
            files.push($(this).val());
        });

        // setTimeout(function(){
        //     slide(0);
        //     $('.app-inner').load('views/order-complete.html', function(){
        //         $('.order-number').text(12345);
        //         hideLoader();
        //     });
        // },1500);

        $.post('https://qapi.evelthost.com/requests', JSON.stringify({
            location : $('#address').val(),
            description : $('#description').val(),
            serviceDate : getEpoch($('#date').val() + ' ' + $('#time').val()),
            name : $('#name').val(),
            email : $('#email').val(),
            phone : $('#phone').val(),
            name2 : $('#contactName').val(),
            phone2 : $('#contactPhone').val(),
            files : files,
            userToken : localStorage.getItem('QUIX_USER_TOKEN')
        })).done(function(data) {
            data = JSON.parse(data);
            setTimeout(function(){
                slide(0);
                $('.app-inner').load('views/order-complete.html', function(){
                    $('.order-number').text(data.requestNumber);
                    hideLoader();
                });
            },1500);
        }).fail(function(data) {
            hideLoader();
            Materialize.toast('<div class="red-text">Request Failed Try Again Later</div>', 4000);
        });
    }

    function getEpoch(timestamp){
        var date = new Date(timestamp),
            utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
        return (utc.getTime() / 1000.0);
    }

    function enableNextButton(){
        var page = $(this).closest('.app-page'),
            next = page.find('.next'),
            isValid = true;

        page.find('input.required:not(.file), textarea.required').each(function(){

            if(!$(this).val()){
                isValid = false;
            }

        });

        if(isValid){
            next.removeClass('disabled');
        }else{
            next.addClass('disabled');
        }
    }

    function slidePage(){
        var left = $(window).width() * $(this).data('slide');

        slide(left);

        setTimeout(function(){
            $('.app-page').scrollTop(0);
        }, 500);

        return false;
    }

    function slide(left){
        $('.app-inner').css('transform', 'translateX(-' + left + 'px)');
    }

    function toggleContactPerson(){

        $('.contact-person').toggle();

    }

    function login(){

        showLoader();
        $.post('https://qapi.evelthost.com/login', JSON.stringify({
            email : $('#login_email').val(),
            password : $('#login_password').val()
        })).done(function(data) {
            data = JSON.parse(data);
            if(data.userToken){
                localStorage.setItem('QUIX_USER_TOKEN', data.userToken);
                $('.app').load('views/account.html', function(){
                    initAccountPage();
                });
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

    function signup(){

        showLoader();
        $.post('https://qapi.evelthost.com/signup', JSON.stringify({
            name : $('#signup_name').val(),
            email : $('#signup_email').val(),
            password : $('#signup_password').val()
        })).done(function(data) {
            data = JSON.parse(data);
            if(data.userToken){
                localStorage.setItem('QUIX_USER_TOKEN', data.userToken);
                $('.app').load('views/account.html', function(){
                    initAccountPage();
                });
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

    function showLoader(){
        $('.loader').addClass('loading').fadeIn(300);
    }

    function hideLoader(){
        setTimeout(function(){
            $('.loader').fadeOut(300).removeClass('loading');
        }, 2000);
    }


})(jQuery); // end of jQuery name space
