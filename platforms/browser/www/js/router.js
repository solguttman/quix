(function($) {

    var ROUTER = function() {

        this.route = localStorage.getItem('ROUTE') || 'request';
        this.availableRoutes = {};

    };

    ROUTER.prototype.add = function(routeSettings) {
        this.availableRoutes[routeSettings.name] = routeSettings;
        return this;
    };

    ROUTER.prototype.init = function() {
        var self = this;
        this.initalizeRoute();
        $(window).on('hashchange', function() {
            self.initalizeRoute(location.hash);
        });
        $(document).on('click', '[route-to]', function(){
        	self.go($(this).attr('route-to'), $(this).attr('route-params'));
        });

    };

    ROUTER.prototype.initalizeRoute = function(route, manualy) {

        var self = this;

        if (route) {
            this.route = route;
        }

        this.route = formatRouteName(this.route);

        // if(route && this.route == localStorage.getItem('ROUTE') && this.route !== 'logout'){
        //     return;
        // }

        if (this.availableRoutes[this.route]) {
            var id = '#' + this.route + '-template',
                template = $(id);

            if (template.length) {
                this.setView();
                if (this.availableRoutes[this.route].controller) {
                    this.availableRoutes[this.route].controller();
                }

            } else {
                this.addRouteToDom(this.availableRoutes[this.route], function(html) {
                    self.setView();
                    if (self.availableRoutes[self.route].controller) {
                        self.availableRoutes[self.route].controller();
                    }
                });
            }


            localStorage.setItem('ROUTE', this.route);
            location.hash = this.route;

        }else{
            console.log('No route found for', this.route);
        }

    };

    ROUTER.prototype.go = function(route, params) {

        if(params){
            localStorage.setItem('params', params);
        }

        this.initalizeRoute(formatRouteName(route));

    };

    ROUTER.prototype.setView = function(html) {

        var id = '#' + this.route + '-template',
            template = $(id);

        $('.app-view').html(template.html());
        $('body').attr('view',this.route);

    };

    ROUTER.prototype.addRouteToDom = function(routeSettings, callback) {
        if (routeSettings && routeSettings.name) {
            var id = routeSettings.name + '-template';
            $('body').append('<script id="' + id + '" type="text/template"></script>');
            $('#' + id).load(routeSettings.templateUrl, function(html) {
                if (callback) {
                    callback(html);
                }
            });
        }
    };

    ROUTER.prototype.setParams = function(params){
        localStorage.setItem('params', JSON.stringify(params));
    };

    ROUTER.prototype.getParams = function(){
        var params = localStorage.getItem('params');
        return $.parseJSON(params) || {};
    };

    function formatRouteName(route) {
        return route.replace('#', '');
    }

    window.Router = new ROUTER();

})(jQuery);
