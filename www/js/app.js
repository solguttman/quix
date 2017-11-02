(function($) {
    $(function() {

        var cache = {},
            addressObj = typeof google !== 'undefined' ? new google.maps.places.Autocomplete(document.getElementById('address'), {}) : {};

        $('.button-collapse').sideNav();
        $('select').material_select();
        $('.datepicker').pickadate({
            min: true
        });
        $('#date_root').appendTo('body');
        $('.modal').modal();
        if(typeof 'Uplader' !== 'undefined'){
            $('.file').uploader();
        }

        $(document).on('file', '.file:not(.has-value)', function(e, data){

            var totalFiles = $('.files .file').length,
                fileId = 'file' + ( totalFiles + 1 );

            $(this).val(data.domain + data.path).change().addClass('has-value required');

            $('.files').append('<div class="col s6"><input class="file" id="'+ fileId +'" name="'+ fileId +'" type="text"></div>');
            $('#' + fileId).uploader({
                label : '<i class="large material-icons">add</i>'
            });

        });

        $(document).on('keyup change input', '.app-page input, .app-page textarea', function(){

            var page = $(this).closest('.app-page'),
                next = page.find('.next'),
                isValid = true;

            page.find('input.required, textarea.required').each(function(){

                if(!$(this).val()){
                    isValid = false;
                }

            });

            if(isValid){
                next.removeClass('disabled');
            }else{
                next.addClass('disabled');
            }

        }).on('keyup change input', '#description, .file', function(){

            if($(this).val()){
                $(this).closest('.app-page').find('.next').removeClass('disabled');
            }

        }).on('click', '[data-slide]', function(){
            var left = $(window).width() * $(this).data('slide');
            $('.app-inner').css('transform', 'translateX(-' + left + 'px)');

            return false;
        }).on('click', '.checkout', showRequest)
        .on('click', '.send-request', sendRequst)
        .on('change', '#useContactPerson', function(){
            $('.contact-person').toggle();
        });

        setTimeout(function(){
            $('.loader').fadeOut(300);
            Materialize.updateTextFields();
        },1000);

    }); // end of document ready

    function showRequest(){
        var container = $('.review-request'),
            preview = '';

        preview += '<p class="center-align flow-text">Describe your problem</p>';

        if($('#description').val()){
            preview += '<div><strong>Description</strong><br/>'+ $('#description').val() +'<br/><br/></div>';
        }

        if($('.file.has-value').length){
            preview += '<div class="row file-preview-container">';

                $('.file.has-value').each(function(){
                    preview += '<div class="col s6"><div class="file-preview" style="background-image:url('+ $(this).val() +')"></div></div>';
                });

            preview += '</div><br/>';
        }

        preview += '<hr/>';
        preview += '<p class="center-align flow-text">Where</p>';
        preview += '<div><strong>Address</strong><br/>'+ $('#address').val() +'<br/></div>';

        preview += '<hr/>';
        preview += '<p class="center-align flow-text">When</p>';
        preview += '<div><strong>Date</strong><br/>'+ $('#date').val() +'<br/></div>';
        preview += '<div><strong>Time</strong><br/>'+ $('#time').val() +'<br/></div>';

        preview += '<hr/>';
        preview += '<p class="center-align flow-text">Info</p>';
        preview += '<div><strong>Name</strong><br/>'+ $('#name').val() +'<br/></div>';
        preview += '<div><strong>Email</strong><br/>'+ $('#email').val() +'<br/></div>';
        preview += '<div><strong>Phone</strong><br/>'+ $('#phone').val() + ' - ' + $('#phoneType').val() +'<br/></div>';

        if($('#useContactPerson').is(':checked')){

            preview += '<hr/>';
            preview += '<p class="center-align flow-text">Contact Person</p>';
            preview += '<div><strong>Name</strong><br/>'+ $('#contactName').val() +'<br/></div>';
            preview += '<div><strong>Phone</strong><br/>'+ $('#contactPhone').val() +'<br/></div>';

        }

        container.html(preview);

        return false;

    }

    function sendRequst(){
        $('.loader').fadeIn(300);
        $.post('https://lab.evelthost.com/quix/api/send.php', $('form').serializeArray()).done(function(data) {
            setTimeout(function(){
                $('.loader').fadeOut(300);
                $('.modal').modal('close');
                //Materialize.toast('<div class="">Request Sent!</div>', 4000);
                $('.app').html('<div><h3 class="center-align">Thanks you</h3><p class="center-align flow-text">work order Number #2345</p></div>');

            },1500);
        }).fail(function(data) {
            $('.loader').fadeOut(300);
            Materialize.toast('<div class="red-text">Request Failed Try Again Later</div>', 4000);
        });
    }

})(jQuery); // end of jQuery name space
