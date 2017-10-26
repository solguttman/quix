(function($) {
    $(function() {

        var cache = {};

        $('.button-collapse').sideNav();
        $('select').material_select();
        $('.datepicker').pickadate({
            min: true
        });
        $('.timepicker').pickatime({
            container :'body'
        });
        $('#date_root').appendTo('body');
        $('#file').uploader();
        $('.modal').modal();

        setTimeout(function(){
            $('.loader').fadeOut(300);
        },1000);

        $(document).on("keyup", "input[name='zipcode']", function() {

            var zipcode = $(this).val().substring(0, 5);

            if (zipcode.length === 5 && /^[0-9]+$/.test(zipcode)) {

                $(this).blur();
                $('.zip-form .next').removeClass('disabled');

                if (zipcode in cache) {

                    handleResp(cache[zipcode]);

                } else {

                    $('.loader').fadeIn(300);

                    // Make AJAX request
                    $.get('https://lab.evelthost.com/quix/api/index.php?zip=' + zipcode).done(function(data) {
                        handleResp(data);

                        // Store in cache
                        cache[zipcode] = data;
                        setTimeout(function(){
                            $('.loader').fadeOut(300);
                        },300);
                    }).fail(function(data) {
                        if (data.responseText && (json = $.parseJSON(data.responseText))) {
                            // Store in cache
                            cache[zipcode] = json;
                        }
                        setTimeout(function(){
                            $('.loader').fadeOut(300);
                        },300);
                    });

                }

            }else{
                $('.zip-form .next').addClass('disabled');
            }

        }).on('keyup change input', '.name-form input', function(){

            var name = $('#name').val(),
                email = $('#email').val(),
                phone = $('#phone').val();

            if(name && email && phone){
                $('.name-form .next').removeClass('disabled');
            }else{
                $('.name-form .next').addClass('disabled');
            }

        }).on('keyup change input', '.address-form input', function(){

            var address = $('#address').val(),
                city = $('#city').val(),
                state = $('#state').val(),
                zip = $('#zip').val();

            if(address && city && state && zip){
                $('.address-form .next').removeClass('disabled');
            }else{
                $('.address-form .next').addClass('disabled');
            }

        }).on('keyup change input', '.description-form textarea', function(){

            var description = $('#description').val();

            if(description){
                $('.description-form .next').removeClass('disabled');
            }else{
                $('.description-form .next').addClass('disabled');
            }

        }).on('click', '[data-slide]', function(){
            var left = $(window).width() * $(this).data('slide');
            $('.app-inner').css('transform', 'translateX(-' + left + 'px)');

            return false;
        }).on('click', '.checkout', showRequest);

        $('#date, #time').on('keyup change input', function(){

            var date = $('#date').val(),
                time = $('#time').val();

            if(date && time){
                $('.date-form .next').removeClass('disabled');
            }else{
                $('.date-form .next').addClass('disabled');
            }

        });

    }); // end of document ready

    function handleResp(zip) {

        var left = $(window).width();

        console.log(zip);

        zip = zip[0] === '{' ? JSON.parse(zip) : false;

        if (zip) {

            $('.app h4').text(zip.city + ', ' + zip.state);
            $('.app-inner').css('transform', 'translateX(-' + left + 'px)');
            $('#city').val(zip.city);
            $('#state').val(zip.state);
            $('#zip').val(zip.zip_code);

        }else{
            $('.app h4').text('');
            $('#city').val('');
            $('#state').val('');
            $('#zip').val('');
        }

        Materialize.updateTextFields();

    }

    function showRequest(){
        var container = $('.review-request');
        container.empty();

        container.append('<div><strong>Name</strong><br/>'+ $('#name').val() +'<br/></div>');
        container.append('<div><strong>Email</strong><br/>'+ $('#email').val() +'<br/></div>');
        container.append('<div><strong>Phone</strong><br/>'+ $('#phone').val() + ' - ' + $('#phoneType').val() +'<br/></div>');

        container.append('<div><strong>Address</strong><br/>'+ $('#address').val() +'<br/></div>');
        container.append('<div><strong>City</strong><br/>'+ $('#city').val() +'<br/></div>');
        container.append('<div><strong>State</strong><br/>'+ $('#state').val() +'<br/></div>');
        container.append('<div><strong>Zip</strong><br/>'+ $('#zip').val() +'<br/></div>');

        container.append('<div><strong>Date</strong><br/>'+ $('#date').val() +'<br/></div>');
        container.append('<div><strong>Time</strong><br/>'+ $('#time').val() +'<br/></div>');

        container.append('<div><strong>Description</strong><br/>'+ $('#description').val() +'<br/></div>');

        if($('#file').val()){
            container.append('<div><strong>File</strong><br/><a href="'+ Uploader.domain + $('#file').val() +'">Link</a><br/></div>');
        }

        return false;

    }

})(jQuery); // end of jQuery name space
