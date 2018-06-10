let markers = {0:{}, 1:{}};

//-----------------------------------------
// Getting data
//-----------------------------------------

function shiftArrayByHalf(a){
  return (
    a
      .slice(Math.ceil(a.length/2),a.length+1)
      .concat(a.slice(0,Math.ceil(a.length/2)))
  );
}

let isLoading = false;

//---- General data loading query

function getData(lat, lng, marker){
  $("#loading").slideDown('fast');
  $("#error").slideUp('fast');
  
  markers[marker]['lat'] = lat;
  markers[marker]['lon'] = lng;

  getNominatimData(lat, lng, marker);
}


function loadingCleanUp(){
  if (!isLoading){
    $("#loading").slideUp('fast');
  }
}

//--- Timezone things
//    note: this gets fired if the Nominatim query succeeded.

function getTimeZoneData(lat, lng, marker){
  const url = "https://api.timezonedb.com/v2/get-time-zone?key=AQO8BXLTHTGW&format=json&by=position&lat="+lat+"&lng="+lng+"&time=1528998082";
  isLoading = true;
  $.ajax({
      type:"POST",
      url:url,
      success: function(data) {
          if (data["status"] == "OK") {
            onTZAjaxSuccess(data, marker);
          } else {
            onTZAjaxError();
          }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        onTZAjaxError();  
      },
      complete: function(){
        isLoading = false;
        loadingCleanUp();
      },
      dataType: 'json',
      jsonp: false
    });
}

function onTZAjaxError(){
  $("#error").text('It looks like we could not get the time zone information of the location. '+
    'This might happen when too many people are looking at the page at the same time or you clicked on a very remote area. '+
    'Please try again in a moment or try a different location. ');
  $("#error").slideDown()
  isLoading = false;
  loadingCleanUp();
}

function onTZAjaxSuccess(data, marker){
  $("#error").slideUp()

  markers[marker]["tzinfo"] = data;

  processTimeZoneData(marker);

  calculateSunriseSunsetTimes(marker);

}

function processTimeZoneData(marker){
  /* The goal of this function is to assign time zone information to the 
  marker: start date and end date of DST and the time offset (compared to UTC)
  in these two periods.

  Two caveats:
    - not all locations have DST; in this case we still assign the data but
      DST will start and end on June 1 and the time offset is the same in both
      periods
    - the Southern hemisphere is the the reverse of the Northern Hemishpere
      in the sense that there is summer time from August to May. I do not take
      the actual naming into account; I only care about start and end dates
      and the time offset.
  */

  var tzinfo = markers[marker]["tzinfo"];
  var lat = markers[marker]['lat'];
  var lng = markers[marker]['lon'];

  var nextTz = getTz(tzinfo["nextAbbreviation"], lat, lng);
  var thisTz = getTz(tzinfo["abbreviation"], lat, lng);

  if (tzinfo["nextAbbreviation"]){
    // this means that there is daylight savings time at this location
    // note: this is actually the "winter" time, so not the daylight savings
    // time on the Southern hemisphere, but the math works out
    markers[marker]["dstStart"] = new Date(tzinfo["dstStart"] * 1000).toISOString().substring(5,10);
    markers[marker]["dstEnd"] = new Date(tzinfo["dstEnd"] * 1000).toISOString().substring(5,10);



    if (nextTz) {
      // the time zone api might return a time zone name, e.g. "GMT", or a 
      // time delta, e.g. "-07" or "+0330"

      // nextAbbreviation is the "normal" time beacuase we used a summer date
      // in the timezone API so that the start and end are in the same year
      // n.b. naming is still NOT correct for Southern hemisphere.
      markers[marker]["timeZoneNormal"] = nextTz;
    } else {
      if (tzinfo["nextAbbreviation"].length > 3){
        // non-whole hour, e.g. "+0330"
        markers[marker]["timeZoneNormal"] = Number(tzinfo["nextAbbreviation"].substring(0,3) + "." + Number(tzinfo["nextAbbreviation"].substring(3,5))/60*100) || 0;
      } else {
        markers[marker]["timeZoneNormal"] = Number(tzinfo["nextAbbreviation"]) || 0;
      }
    }

    if (thisTz) {
      markers[marker]["timeZoneDST"] = thisTz || 0;
    } else {
      if (tzinfo["abbreviation"].length > 3) {
        // non-whole hour, e.g. "+0330"
        markers[marker]["timeZoneDST"] = Number(tzinfo["abbreviation"].substring(0,3) + "." + Number(tzinfo["abbreviation"].substring(3,5))/60*100) || 0;
      } else {
        markers[marker]["timeZoneDST"] = Number(tzinfo["abbreviation"]) || 0; 
      }
    }
  } else {
    // no DST, but we populate all the fields just as if it existed –
    // but with the same data for both periods
    markers[marker]["dstStart"] = "06-01";
    markers[marker]["dstEnd"] = "06-01";
    if (thisTz) {
      markers[marker]["timeZoneNormal"] = thisTz;
      markers[marker]["timeZoneDST"] = thisTz;
    } else {
      markers[marker]["timeZoneNormal"] = Number(tzinfo["abbreviation"]) || 0;
      markers[marker]["timeZoneDST"] = Number(tzinfo["abbreviation"]) || 0;
    }
  }

}

function calculateSunriseSunsetTimes(m){
  var results = {'date':[], 'dawn':[], 'dusk':[]};
  marker = markers[m];
      
  for (i = 0; i < 365; i++) {     
      var baseDate = Date.parse("2018-01-01"); 
      var newDate = baseDate.addDays(i).addHours(12);
      var tzOffset = newDate.getTimezoneOffset();
      
      var dawn = SunCalc.getTimes(newDate, marker.lat, marker.lon).dawn;
      dawn.add(tzOffset).minutes();
      
      var dusk = SunCalc.getTimes(newDate, marker.lat, marker.lon).dusk;
      dusk.add(tzOffset).minutes();

      if (Date.compare(newDate, Date.parse("2018-"+marker.dstStart)) >= 0 && 
          Date.compare(newDate, Date.parse("2018-"+marker.dstEnd)) < 0) {
          dawn.add(marker['timeZoneDST']).hours();
          dusk.add(marker['timeZoneDST']).hours();
      } else {
          dawn.add(marker['timeZoneNormal']).hours();
          dusk.add(marker['timeZoneNormal']).hours();
      };

      //results['date'].push(newDate)
      results['date'].push(newDate.toString('yyyy-MM-dd'));
      //results['dawn'].push(dawn);
      results['dawn'].push(dawn.getHours()+dawn.getMinutes()/60);
      //results['dawn'].push(dusk);
      results['dusk'].push(dusk.getHours()+dusk.getMinutes()/60);

      // there are some spikes at CET/CEST change in _other regions, so 
      // here's an ugly hack to fix it:
      // TODO: investigate cause and actually fix it
      if (Math.abs(results['dawn'][results['dawn'].length - 3] - results['dawn'][results['dawn'].length - 4]) < 0.5 &&
          Math.abs(results['dawn'][results['dawn'].length - 3] - results['dawn'][results['dawn'].length - 1]) < 0.5 &&
          Math.abs(results['dawn'][results['dawn'].length - 2] - results['dawn'][results['dawn'].length - 1]) > 0.8){
              results['dawn'][results['dawn'].length - 2] = results['dawn'][results['dawn'].length - 1];
      }
      if (Math.abs(results['dusk'][results['dusk'].length - 3] - results['dusk'][results['dusk'].length - 4]) < 0.5 &&
          Math.abs(results['dusk'][results['dusk'].length - 3] - results['dusk'][results['dusk'].length - 1]) < 0.5 &&
          Math.abs(results['dusk'][results['dusk'].length - 2] - results['dusk'][results['dusk'].length - 1]) > 0.8){
              results['dusk'][results['dusk'].length - 2] = results['dusk'][results['dusk'].length - 1];
      }

      // Don't draw a vertical line if we go over midnight with sunrise/sunet
      var dawndiff = Math.abs(results['dawn'][results['dawn'].length - 1] - results['dawn'][results['dawn'].length - 2]);
      var duskdiff = Math.abs(results['dusk'][results['dusk'].length - 1] - results['dusk'][results['dusk'].length - 2]);
      if (dawndiff > 10 && results['dawn'][results['dawn'].length - 2] !== null) {
        results['dawn'][results['dawn'].length - 2] = null;
      }
      if (duskdiff > 10 && results['dusk'][results['dusk'].length - 2] !== null) {
        results['dusk'][results['dusk'].length - 2] = null;
      }
      
  }

  if ($('#shiftSH').prop('checked') && marker.lat < 0) {
    results['dawn'] = shiftArrayByHalf(results['dawn']);
    results['dusk'] = shiftArrayByHalf(results['dusk']);
    marker['shifted'] = 1;
  }

  marker['dawn'] = results['dawn']
  marker['dusk'] = results['dusk']
  
  if (m == 0){
      var d1 = ['data1'].concat(results['dawn']);
      var d2 = ['data2'].concat(results['dusk']);
  } else {
      var d1 = ['data3'].concat(results['dawn']);
      var d2 = ['data4'].concat(results['dusk']);
  }
  chart.load({
      columns: [
          ['x'].concat(results['date']),
          d1,
          d2
      ]
  });
  chart.flush();
}

//---- Nominatim things 

function getNominatimData(lat, lng, marker){
  var url = "https://nominatim.openstreetmap.org/reverse?format=json&lat="+lat+"&lon="+lng+"&zoom=18&addressdetails=1&accept-language=en";
  isLoading = true;
  $.ajax({
    type:"POST",
    url:url,
    success: function(data) {
        if (!data["error"]) {
          onNominatimAjaxSuccess(data, marker, lat, lng);
        } else {
          onNomiatimAjaxError();
        }
    },
    error: function (xhr, ajaxOptions, thrownError) {
      isLoading = false;
      onNomiatimAjaxError();
    },
    complete: function(){
      
    },
    dataType: 'json',
    jsonp: false
  });
}

function onNominatimAjaxSuccess(data, marker, lat, lng){
  var location = '[unknown location]';
  var locationParts = ["city", "town", "village", "county", "state", "country"];
  locationParts.some(function(element){
    if (data["address"][element]){
      location = data["address"][element];
      return true;
    }
  });

  $('.loc').text(JSON.stringify(data) + '  '+
                location);
  markers[marker]["location"] = location;
  if (marker == 0){
    chart.data.names({data1: 'Sunrise in ' + location, data2: 'Sunset in ' + location});
  } else {
    chart.data.names({data3: 'Sunrise in ' + location, data4: 'Sunset in ' + location});
  }

  getTimeZoneData(lat, lng, marker);
}

function onNomiatimAjaxError(){
  $("#error").text('It looks like we could not get information about the location you picked. '+
    'This might happen when too many people are looking at the page at the same time. '+
    'Please try again in a moment.');
  $('#error').slideDown();
  isLoading = false;
  loadingCleanUp();
}


//-----------------------------------------
// Chart things
//-----------------------------------------

function generateDatesOfYear(){
    var dates = [];
    for (i = 0; i < 365; i++) {
      var myDate = Date.parse("2018-01-01").addHours(12);
      myDate.addDays(i);
      dates.push(myDate.toString('yyyy-MM-dd'));
    }
    return dates;
}

yearDates = generateDatesOfYear();

var chart = c3.generate({
    bindto: "#chart",
    data: {
        x: 'x',
        xFormat: '%Y-%m-%d', // 'xFormat' can be used as custom format of 'x'
        columns: [
            ['x'].concat(yearDates),
            ['data1'].concat(Array(365).fill(0)),
            ['data2'].concat(Array(365).fill(0)),
            ['data3'].concat(Array(365).fill(0)),
            ['data4'].concat(Array(365).fill(0)),
            
        ],
        colors: {
          data1: '#17a2b8',
          data2: '#007bff',
          data3: '#ffc107',
          data4: '#fd7e14'
        }
    },
    axis: {
        x: {
            type: 'timeseries',
            tick: {
                count: 52,
                format: '%m-%d'
            }
        },
        y: {
            min: 0,
            max: 24,
            padding: {top:0, bottom:0},
            tick: {
              count: 25, 
              format: function (d) { return Math.floor(d).toString().padStart(2,'0') + ':' + 
                                            Math.round((d % 1)*60).toString().padStart(2,'0'); }
            }
        }
    },
    point: {
      show: false   
    },
    grid: {
      y: {show: true}
    }
});

//-----------------------------------------
// Map things
//-----------------------------------------

var orangeIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

var marker;
var last_moved_marker = 0;

var map = L.map('map').setView([49.525208, 11.953125], 5);
L.tileLayer('http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png ', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 7,
    id: 'osm.humanitarian',
}).addTo(map);


function onMapClick(e){
  if (last_moved_marker == 0) {
    if (markers[1]["marker"]) {
      map.removeLayer(markers[1]["marker"]);
    }
    markers[1]["marker"] = new L.Marker(e.latlng, {icon: orangeIcon, draggable: true});
    markers[1]["marker"].on('dragstart', function(e) {
      map.off('click', onMapClickIfNotLoading);
    });
    markers[1]["marker"].on('dragend', function(e) {
      getData(markers[1]["marker"]._latlng.lat, markers[1]["marker"]._latlng.lng, 1);
      last_moved_marker = 1;
      setTimeout(function() {
        map.on('click', onMapClickIfNotLoading);
      }, 100);
    });
    markers[1]["marker"].addTo(map);

    getData(e.latlng.lat, e.latlng.lng, 1);
    last_moved_marker = 1;
  } else {
    if (markers[0]["marker"]) {
      map.removeLayer(markers[0]["marker"]);
    }
    markers[0]["marker"] = new L.Marker(e.latlng, {draggable: true});
    markers[0]["marker"].on('dragstart', function(e) {
      map.off('click', onMapClickIfNotLoading);
    });
    markers[0]["marker"].on('dragend', function(e) {
      getData(markers[0]["marker"]._latlng.lat, markers[0]["marker"]._latlng.lng, 0);
      last_moved_marker = 0;
      setTimeout(function() {
        map.on('click', onMapClickIfNotLoading);
      }, 100);
    });
    markers[0]["marker"].addTo(map);

    getData(e.latlng.lat, e.latlng.lng, 0);
    last_moved_marker = 0;
  }
}

function onMapClickIfNotLoading(e){
  if (!isLoading){
    onMapClick(e);
  }
}

map.on('click', onMapClickIfNotLoading);

$(window).bind("load",function(){
  last_moved_marker = 1;
  onMapClick({'latlng': L.latLng(47.49801, 19.03991)});
  last_moved_marker = 0;
  onMapClick({'latlng': L.latLng(52.3702, 4.8952)});
});

$(document).ready(function(){
  $('#shiftSH').on('change', function() {
    let didSomethingChange; 
    if (this.checked) {
      [0, 1].forEach(m => {
        var marker = markers[m];
          if (marker.lat < 0 && !marker.shifted){
            marker['dawn'] = shiftArrayByHalf(marker['dawn']);
            marker['dusk'] = shiftArrayByHalf(marker['dusk']);
            marker['shifted'] = 1;
            didSomethingChange = true;
          }
      });
    } else {
      [0, 1].forEach(m => {
        var marker = markers[m];
          if (marker.lat < 0 && marker.shifted){
            marker['dawn'] = shiftArrayByHalf(marker['dawn']);
            marker['dusk'] = shiftArrayByHalf(marker['dusk']);
            marker['shifted'] = 0;
            didSomethingChange = true;
          }
      });
    }

    if(didSomethingChange){
      chart.load({
        columns: [
            ['data1'].concat(markers[0]['dawn']),
            ['data2'].concat(markers[0]['dusk']),
            ['data3'].concat(markers[1]['dawn']),
            ['data4'].concat(markers[1]['dusk'])
        ]
      });
      chart.flush();
    }
});

})