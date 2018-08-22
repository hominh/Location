var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJSONresponse = function (res,status,content) {
    res.status(status);
    res.json(content);
};

var theEarth = (function(){
    var earthRadius = 6371;

    var getDistanceFromRads = function(rads) {
        return parseFloat(rads * earthRadius);
    };

    var getRadFromDistance = function(distance) {
        return parseFloat(distance / earthRadius);
    };
    return {
        getDistanceFromRads: getDistanceFromRads,
        getRadFromDistance: getRadFromDistance
    };
});

/* Get location by id */
module.exports.locationsReadOne = function(req,res) {
    console.log('Finding location details', req.params);
    if(!req.params.locationid) {
        sendJSONresponse(res, 404, {
            "message": "Not found, location id is require"
        });
    }
    //console.log(Loc);
    //sendJSONresponse(res, 200, "location");
    Loc.findById(req.params.locationid)
        .select('-reviews -rating')
        .exec(
            function(err,location) {
                if(!location) {
                    sendJSONresponse(res, 404, {
                        "message": "locationid not found"
                    });
                    return;
                }
                if(err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }
                if(location) {
                    sendJSONresponse(res, 200, location);
                }

            }
        );
};

module.exports.locationsListByDistance = function(req,res) {
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var maxDistance = parseFloat(req.query.maxDistance);
    var point = {
        type: "Point",
        coordinates: [lng,lat]
    };
    var geoOptions = {
        spherical: true,
        maxDistance: theEarth.getRadFromDistance(maxDistance),
        num: 10
    };

    if(!lng || !lat || !maxDistance) {
        console.log('locationsListByDistance missing params');
        sendJSONresponse(res, 404, {
            "message": "lng, lat and maxDistance query parameters are all required"
        });
    }
    Loc.geoNear(point,geoOptions,function(err,results,stats){
        var locations;
        console.log('Geo Results', results);
        console.log('Geo stats', stats);
        if(err) {
            console.log('geoNear error:', err);
            sendJSONresponse(res, 404, err);
        }
        else {
            sendJSONresponse(res, 200, "dkm");
        }
    });
};
