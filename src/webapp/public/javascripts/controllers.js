var myApp = angular.module('myApp', [], function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}).service('toolsService', function($http){
        var recommends = [];
        var tried = false;
        return {
            getRecommends: function(){
                if( recommends.length == 0 && tried == false) {

                    tried = true;

                    $http({
                        method: 'GET',
                        url: '/refresh'
                    }).success(function(data, status, headers, config) {

                            // only get overdue recommends
                            var overdue = [];

                            for(var i = 0; i < data.length; i++) {
                                if(data[i].recommendStatus != "ACTIVE")   {
                                    overdue.push(data[i]);
                                }

                            }


                            recommends = overdue;

                        }).error(function(data, status, headers, config) {
                            console.log(status);
                        });

                }
                return recommends;

            } ,
            setRecommends: function(value){
                recommends = value;
            }
        };
    });

function RecommendCtrl($scope, $http, toolsService) {


    $scope.recommends = toolsService.getRecommends;
    $scope.curRecommend = {};
    $scope.activities = [];

    $scope.addActivity = function(){

        var currentDate = new Date();
        var tempList = $scope.activities;
        var newActivity = {individualId: $scope.curRecommend.individualId, activityDate: currentDate};

        tempList.push(newActivity);
        tempList.sort(function(a,b){return a.activityDate < b.activityDate});

        $http({
            method: 'POST',
            url: '/activity',
            data: newActivity
        }).success(function(data, status, headers, config) {

                 // Everthing is good.

                // Update UI with new Date
               // tempList.push(data);
               // tempList.sort(function(a,b){return a.activityDate < b.activityDate});

            }).error(function(data, status, headers, config) {

                // Remove last one.

                console.log(status);
            });


        $scope.activities = tempList;
    };

    $scope.getRelative = function(dateString){

        var d = new Date(dateString);

        return d.toRelativeTime(5000);
    };

    $scope.selectActive = function(el){

        // Clear last active
        if($scope.curRecommend){
            $scope.curRecommend.active = '';

        }

        el.active = 'active';
        $scope.curRecommend = el;

        // Get activities for this group
        $http({
            method: 'GET',
            url: '/activity/' + $scope.curRecommend.individualId
        }).success(function(data, status, headers, config) {
                data.sort(function(a,b){return a.activityDate < b.activityDate});
                $scope.activities = data;

            }).error(function(data, status, headers, config) {
                console.log(status);
            });

        //alert(el);
    };

    $scope.highlightType = function(el){

        switch(el.recommendStatus){
            case "EXPIRED_OVER_3_MONTHS":
                return "alert-danger";
                break;
            case "EXPIRED_LESS_THAN_3_MONTHS":
                return "alert-danger";
                break;
            case "EXPIRED_LESS_THAN_1_MONTH":
                return "alert-danger";
                break;
            case "EXPIRING_THIS_MONTH":
                return "";
                break;
            case "EXPIRING_NEXT_MONTH":
                return "";
                break;
            case "ACTIVE":
                return "";
                break;
        }

    };

    $scope.iconType = function(el){

        switch(el.recommendStatus){
            case "EXPIRED_OVER_3_MONTHS":
                return "exclamation-sign";
                break;
            case "EXPIRED_LESS_THAN_3_MONTHS":
                return "exclamation-sign";
                break;
            case "EXPIRED_LESS_THAN_1_MONTH":
                return "exclamation-sign";
                break;
            case "EXPIRING_THIS_MONTH":
                return "exclamation-sign";
                break;
            case "EXPIRING_NEXT_MONTH":
                return "exclamation-sign";
                break;
            case "ACTIVE":
                return "ok";
                break;
        }

    };


}



function MenuCtrl($scope, $http, toolsService){

    // Set default values from server
    $scope.user = executiveTools.user;

    $scope.login = function(){

        var data = {'username': $scope.username, 'password': $scope.password};

        $http({
            method: 'POST',
            url: '/login',
            data:data
        }).success(function(data, status, headers, config) {

                $scope.user = data;
                $scope.user.permissions = {loggedIn: true};


                // Refresh data
                $scope.refresh();


            }).error(function(data, status, headers, config) {
                console.log(status);
            });

    };


    $scope.refresh = function(){

        $http({
            method: 'GET',
            url: '/refresh'
        }).success(function(data, status, headers, config) {

                // only get overdue recommends
                var overdue = [];

                for(var i = 0; i < data.length; i++) {
                    if(data[i].recommendStatus != "ACTIVE")   {
                        overdue.push(data[i]);
                    }

                }

                toolsService.setRecommends(overdue);


            }).error(function(data, status, headers, config) {
                console.log(status);
            });

    } ;


}



/*
 * date conversion - this method is called when createdDate is get
 */
function convertDate(date, format) {

    var d = new Date(date);

    switch(format) {
        case 1:
            format = 'fullDate';
            break;
        case 2:
            format = 'm/d/yy h:MM TT';
            break;
        case 3:
            format = 'dddd, mmmm d, yyyy h:MM TT';
            break;
        case 4:
            format = 'longDate';
            break;
        default:
            format = 'fullDate';
            break;
    }

    return dateFormat(d, format);
}

/*
 * Date Format
 */

var dateFormat = function() {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g, timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, timezoneClip = /[^-+\dA-Z]/g, pad = function(val, len) {
        val = String(val);
        len = len || 2;
        while(val.length < len)
            val = "0" + val;
        return val;
    };
    // Regexes and supporting functions are cached through closure
    return function(date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if(arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if(isNaN(date))
            throw new SyntaxError("invalid date");
        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if(mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get", d = date[_ + "Date"](), D = date[_ + "Day"](), m = date[_ + "Month"](), y = date[_ + "FullYear"](), H = date[_ + "Hours"](), M = date[_ + "Minutes"](), s = date[_ + "Seconds"](), L = date[_ + "Milliseconds"](), o = utc ? 0 : date.getTimezoneOffset(), flags = {
            d : d,
            dd : pad(d),
            ddd : dF.i18n.dayNames[D],
            dddd : dF.i18n.dayNames[D + 7],
            m : m + 1,
            mm : pad(m + 1),
            mmm : dF.i18n.monthNames[m],
            mmmm : dF.i18n.monthNames[m + 12],
            yy : String(y).slice(2),
            yyyy : y,
            h : H % 12 || 12,
            hh : pad(H % 12 || 12),
            H : H,
            HH : pad(H),
            M : M,
            MM : pad(M),
            s : s,
            ss : pad(s),
            l : pad(L, 3),
            L : pad(L > 99 ? Math.round(L / 10) : L),
            t : H < 12 ? "a" : "p",
            tt : H < 12 ? "am" : "pm",
            T : H < 12 ? "A" : "P",
            TT : H < 12 ? "AM" : "PM",
            Z : utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
            o : (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
            S : ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
        };

        return mask.replace(token, function($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default" : "ddd mmm dd yyyy HH:MM:ss",
    shortDate : "m/d/yy",
    mediumDate : "mmm d, yyyy",
    longDate : "mmmm d, yyyy",
    fullDate : "dddd, mmmm d, yyyy",
    shortTime : "h:MM TT",
    mediumTime : "h:MM:ss TT",
    longTime : "h:MM:ss TT Z",
    isoDate : "yyyy-mm-dd",
    isoTime : "HH:MM:ss",
    isoDateTime : "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime : "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};


Date.prototype.toRelativeTime = function(now_threshold) {
    var delta = new Date() - this;
    now_threshold = parseInt(now_threshold, 10);

    if(isNaN(now_threshold)) {
        now_threshold = 0;
    }

    if(delta <= now_threshold) {
        return 'Just now';
    }

    var units = null;
    var conversions = {
        millisecond : 1, // ms    -> ms
        second : 1000, // ms    -> sec
        minute : 60, // sec   -> min
        hour : 60, // min   -> hour
        day : 24, // hour  -> day
        month : 30, // day   -> month (roughly)
        year : 12      // month -> year
    };

    for(var key in conversions) {
        if(delta < conversions[key]) {
            break;
        } else {
            units = key;
            // keeps track of the selected key over the iteration
            delta = delta / conversions[key];
        }
    }

    // pluralize a unit when the difference is greater than 1.
    delta = Math.floor(delta);
    if(delta !== 1) {
        units += "s";
    }

    return [delta, units, "ago"].join(" ");
};