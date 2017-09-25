
var visualizedTraitList = []
var offenderCircles = new Array()
var offenderMarkers = new Array()
var schoolCircles = new Array()
var markerClusterers = new Array()
var markerPositions = new Array()
var schoolPositions = new Array()
var offenderDensityPolygons = new Array()
var visMin = 10000;
var visMax = -10000;
var overlay = null;
var currentCircleRadius = 304.8;
var positionCircles = {};
var offendersInZoom = new Array();
var schoolsInZoom = new Array();
var tractCentroids = new Array();
var visibleTracts = new Array();
var imageIcon = {
    url :'assets/img/school.JPG'
  };
var offenderDensitySelected = true;
var displayOffenderDensities = false;
document.getElementById("offenderGradientDiv").style.visibility='hidden';
var tractSociodemographics = new Array();
var selectedTractIndex = -1;

//% with bachelor's degree
var educationRates = []
var educationRateMin = 10000;
var educationRateMax = -10000;
var readEducation = function() {
  d3.csv("assets/data/tractEducation.csv", function(data){
    educationRates = new Array();
    for(var i = 0; i < data.length; i++) {
      var rate = parseFloat(data[i].percentBachelor);
      educationRates.push(rate);
      if(rate > educationRateMax) {
        educationRateMax = rate;
      }
      if(rate < educationRateMin) {
        educationRateMin = rate;
      }

    }
    
  });
};
readEducation();

//% pop receiving food stamps or other public assistance
var publicRates = new Array();
var publicRateMin = 10000;
var publicRateMax = -10000;
var readPublic = function() {

  d3.csv("assets/data/tractPublicAssistance.csv", function(data){
    publicRates = []
    for(var i = 0; i < data.length; i++) {
      var rate = parseFloat(data[i].assistance);
      publicRates.push(rate);
      if(rate > publicRateMax) {
        publicRateMax = rate;
      }
      if(rate < publicRateMin) {
        publicRateMin = rate;
      }
    }

  });
};
readPublic();

//median income
var medianIncomes = new Array();
var incomeMin = 10000000;
var incomeMax = -10000000;
var readIncome = function() {
  d3.csv("assets/data/tractMedianIncome.csv", function(data){
    medianIncomes = []
    for(var i = 0; i < data.length; i++) {
      if(data[i].income == "null") {
        medianIncomes.push("null");
      }
      else {
        var rate = parseInt(data[i].income)
        medianIncomes.push(rate);
        if(rate > incomeMax) {
          incomeMax = rate;
        }
        if(rate < incomeMin) {
          incomeMin = rate;
        }
      }
    }
  });
};
readIncome();

//% without health insurance
var healthRates = []
var healthRateMin = 10000;
var healthRateMax = -10000;
var readHealth = function() {
  d3.csv("assets/data/tractNoHealthInsurance.csv", function(data){
    healthRates = new Array();
    for(var i = 0; i < data.length; i++) {
      var rate = parseFloat(data[i].healthrate);
      healthRates.push(rate);
      if(rate > healthRateMax) {
        healthRateMax = rate;
      }
      if(rate < healthRateMin) {
        healthRateMin = rate;
      }

    }
  });
};
readHealth();

//% below poverty line
var povertyRates= []
var povertyMin = 10000;
var povertyMax = -10000;
var readPoverty = function() {
  d3.csv("assets/data/tractPovertyRatio.csv", function(data){
    povertyRates = new Array();
    for(var i = 0; i < data.length; i++) {
      var rate = parseFloat(data[i].povertyrate);
      povertyRates.push(rate);
      if(rate > povertyMax) {
        povertyMax = rate;
      }
      if(rate < povertyMin) {
        povertyMin = rate;
      }

    }
  });
};
readPoverty();

//% female-headed households
var fhhs = []
var fhhMin = 10000;
var fhhMax = -10000;
var readFHHs = function() {
  d3.csv("assets/data/tractFHH.csv", function(data){
    fhhs = new Array();
    for(var i = 0; i < data.length; i++) {
      var rate = parseFloat(data[i].fhh);
      fhhs.push(rate);
      if(rate > fhhMax) {
        fhhMax = rate;
      }
      if(rate < fhhMin) {
        fhhMin = rate;
      }

    }
  });
};
readFHHs();

//% household size > 4
var hhSizes = []
var hhSizeMin = 10000;
var hhSizeMax = -10000;
var readHHSizes = function() {
  d3.csv("assets/data/tractHHSize.csv", function(data){
    hhSizes = new Array();
    for(var i = 0; i < data.length; i++) {
      var rate = parseFloat(data[i].sizeGreaterThan5);
      hhSizes.push(rate);
      if(rate > hhSizeMax) {
        hhSizeMax = rate;
      }
      if(rate < hhSizeMin) {
        hhSizeMin = rate;
      }

    }
  });
};
readHHSizes();

//% Under 18
var under18s = []
var u18Min = 10000;
var u18Max = -10000;
var readUnder18 = function() {
  d3.csv("assets/data/tractUnder18.csv", function(data){
    under18s = new Array();
    for(var i = 0; i < data.length; i++) {
      var rate = parseFloat(data[i].percentUnder18);
      under18s.push(rate);
      if(rate > u18Max) {
        u18Max = rate;
      }
      if(rate < u18Min) {
        u18Min = rate;
      }

    }
  });
};
readUnder18();

  //offender population density
  var offenderDensities = []
  var offenderRateMin = 10000;
  var offenderRateMax = -10000;
  var readOffenderDensities = function() {
    d3.csv("assets/data/tractOffenderDensity1.csv", function(data){
      offenderDensities = new Array();
      for(var i = 0; i < data.length; i++) {
        var rate = parseFloat(data[i].offenderDensity);
        offenderDensities.push(rate);
        if(rate > offenderRateMax) {
          offenderRateMax = rate;
        }
        if(rate < offenderRateMin) {
          offenderRateMin = rate;
        }

      }
      visMin = offenderRateMin;
      visMax = offenderRateMax;
      visualizedTraitList = offenderDensities;
      document.getElementById("demographicMin").innerHTML=visMin.toFixed(3);
      document.getElementById("demographicMax").innerHTML=visMax.toFixed(3);
      //$("#offenderDensityMin").stt=offenderRateMi
    });
  };
  readOffenderDensities();


  window.initMap = function() {
    var el = document.querySelector('#heatmap');
    var width = $('#heatMapContainer').width();
    var height = $('#heatmap').height();
    var projection = d3.geoAlbersUsa().scale(5000).translate([width / 8, height / 2.5]);
    var google = window.google;
    var tractMarkers = [];
    var map = new google.maps.Map(el, {
  center: new google.maps.LatLng(38.659175,  -90.396881),
  zoom: 9,
  minZoom: 7,
  maxZoom: 20
  //mapTypeControlOptions: {
      //mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain','styled_map']
  //}
    });
      var markerCluster = new MarkerClusterer(map, [],{
          maxZoom:12,
          gridSize: 100,
            imagePath: 'assets/img/m'
      });
      
      var markerClusterSchool = new MarkerClusterer(map, [],{
          maxZoom:12,
          gridSize: 100,
          imagePath: 'assets/img/s'
      });
      


    //Credit to Google Maps search api: https://developers.google.com/maps/documentation/javascript/examples/places-searchbox
      var input = document.getElementById('mapsearch');
      var searchBox = new google.maps.places.SearchBox(input);
      //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
      });

      var markers = [];
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }

        markers.forEach(function(marker) {
          marker.setMap(null);
        });
        markers = [];

        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
          if (!place.geometry) {
            console.log("Returned place contains no geometry");
            return;
          }
          var icon = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };

          markers.push(new google.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location
          }));

          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        map.fitBounds(bounds);
      });

//inspired by  http://www.techstrikers.com/GoogleMap/Code/how-to-draw-circle-on-marker-click-in-google-map.php
var addCircle = function(location) {
        if (!(location in positionCircles)) {
          var offenderCircle = new google.maps.Circle({      
            strokeColor: '#000000',      
            strokeOpacity: 0.8,      
            strokeWeight: 1,      
            fillColor: '#00FF0F',      
            fillOpacity: 0.5,      
            center: location,      
            radius: currentCircleRadius, 
            map: map,
            zIndex: 10000  

          });
          positionCircles[location] = offenderCircle;
          offenderCircles.push(positionCircles[location])
      }
      else {
        if(positionCircles[location].map == null) {
          positionCircles[location].setRadius(currentCircleRadius)
          positionCircles[location].setMap(map);
        }
        else {
          positionCircles[location].setMap(null);
        }
      }
}

var miniEl = document.querySelector('#minimap');
      var miniWidth = $('#minimap').width();
      var miniHeight = $('#minimap').height();
      var miniProjection = d3.geoAlbersUsa().scale(5000).translate([miniWidth / 8, miniHeight / 2.5]);
      var miniGoogle = window.google;

      var miniMap = new miniGoogle.maps.Map(miniEl, {
        center: new miniGoogle.maps.LatLng(37.9643,  -91.8318),
        draggable: false,
        minZoom: 4,
        maxZoom: 4,
        zoom: 4,
        mapTypeControlOptions: {
          mapTypeIds: ['terrain']
        }
      });

      var rectangleArray = [];
      function clearRect() {
        for (var i=0; i<rectangleArray.length; i++) {
          rectangleArray[i].setMap(null);
        }
        rectangleArray.length = 0;
      }

      google.maps.event.addListener(map,'bounds_changed', function() 
      {
        clearRect();
        var miniRight = map.getBounds().getNorthEast().lng();
        var miniTop = map.getBounds().getNorthEast().lat();
        var miniLeft = map.getBounds().getSouthWest().lng();
        var miniBottom = map.getBounds().getSouthWest().lat();
        var miniBounds = {
          north: miniTop,
          south: miniBottom,
          east: miniRight,
          west: miniLeft
        };
        rectangle = new google.maps.Rectangle({
          bounds: miniBounds,
          editable: false,
          draggable: false
        });
        rectangleArray.push(rectangle);
        rectangleArray[0].setMap(miniMap);
      });


function SVGOverlay (map) {
  this.map = map;
  this.svg = null;
  this.coords = [];

  this.onPan = this.onPan.bind(this);

  this.setMap(map);
}

SVGOverlay.prototype = new google.maps.OverlayView();
var g;
var layer;


SVGOverlay.prototype.onAdd = function () {
  this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  this.svg.style.position = 'absolute';
  this.svg.style.top = 0;
  this.svg.style.left = 0;
  this.svg.style.width = $('#heatMapContainer').width();
  this.svg.style.height = $('#heatmap').height();
  this.svg.style.pointerEvents = 'none';
  layer = d3.select(this.getPanes().overlayLayer).append("div");

  var bounds = this.map.getBounds(),
  center = bounds.getCenter(),
  ne = bounds.getNorthEast(),
  sw = bounds.getSouthWest();
  var topRight = this.map.getProjection().fromLatLngToPoint(this.map.getBounds().getNorthEast());
  var bottomLeft = this.map.getProjection().fromLatLngToPoint(this.map.getBounds().getSouthWest());
  var scale = Math.pow(2, this.map.getZoom());

  var proj = this.map.getProjection();



  g = layer.append("svg")
  .attr('width', width)
  .attr('height', height);

  d3.json("assets/data/mo.json", function(error, data) {
    if (error) throw error;
    
    
    var simplifyTolerace = 0.0008;
    var newdata = [];
    var i = 0;
    data.features.forEach(function(d) {
      var points = d.geometry.coordinates[0];
      newpoints = simplify(points,simplifyTolerace,false);
      i+=1; 

      d.geometry.coordinates[0] = newpoints;
    });
    mapdata = data;
    var colorScale = d3.scaleLinear().domain([visMin,visMax]).range(["#ffe6e6","#990000"]);
    var offenderDensityColorScale = d3.scaleLinear().domain([offenderRateMin,offenderRateMax]).range(["#f0f8ff","#191970"]);


    var addListenersOnPolygon = function(polygon) {
      google.maps.event.addListener(polygon, 'click', function (event) {
        selectedTractIndex = polygon.index;
        findSchoolOffenderDistances(polygon);
      });  
    }


    for(i = 0; i < mapdata.features.length; i++) {
    var currentCoords = mapdata.features[i].geometry.coordinates[0];
    var polygonCoords = [];
    var latAvg = 0.0;
    var lngAvg = 0.0;
    for(j = 0; j < currentCoords.length; j++) {
      latAvg += currentCoords[j][1];
      lngAvg += currentCoords[j][0];
      polygonCoords.push({lat: currentCoords[j][1], lng: currentCoords[j][0]});
    }
    latAvg /= currentCoords.length;
    lngAvg /= currentCoords.length;
    var tractPolygon = new google.maps.Polygon({
      paths: polygonCoords,
      strokeWeight: 1,
      strokeOpacity: 0.8,
      fillColor: colorScale(visualizedTraitList[i]),
      fillOpacity: 0.5,
      index: i
    });

    tractMarkers.push(tractPolygon);

    var boundaryPath = [];
    for(j = 0; j < currentCoords.length; j++) {
      boundaryPath.push({lat: (currentCoords[j][1]+latAvg)/2.0, lng: (currentCoords[j][0]+lngAvg)/2.0});
    }
    var centroid = new google.maps.LatLng(latAvg,lngAvg);
    tractCentroids.push(centroid);
    if(map.getBounds().contains(centroid))
    {
      visibleTracts.push(i);
    }

    offenderDensityPolygons[i] = new google.maps.Polygon({
      paths: boundaryPath,
      strokeWeight: 0,
      strokeOpacity: 1.0,
      fillColor: offenderDensityColorScale(offenderDensities[i]),
      fillOpacity: 1.0,
      index: i,
      map: map
    });
    //offenderDensityPolygons.push(tractOffenderPolygon);

  }
  for (var i = 0; i < tractMarkers.length; i++) {
    tractMarkers[i].setMap(map);
    addListenersOnPolygon(tractMarkers[i]);
    addListenersOnPolygon(offenderDensityPolygons[i]);
    if(displayOffenderDensities) {
      offenderDensityPolygons[i].setMap(map);
    }
    else {
      offenderDensityPolygons[i].setMap(null);
    }
  }
});


  d3.csv("assets/data/sexOffenders.csv", function(data) {
    for(var i = 0; i < data.length; i++) {
      var longitude = parseFloat(data[i].longitude);
      var lat = parseFloat(data[i].latitude);
      var coord = [longitude, lat];
      if(coord[1] < 40.559 && coord[0] > -95.8
        && coord[1] > 35.7 && coord[0] < -88.9
        ) {
        var offenderMarker = new google.maps.Marker({
        position: {lat: coord[1], lng: coord[0]},
        map: map,
        radiusCircle: null
      });
      markerPositions.push(offenderMarker.getPosition());

    if(map.getBounds().contains(offenderMarker.getPosition()))
    {
        offendersInZoom.push(offenderMarker.getPosition());
    } 
    offenderMarker.addListener('click', function(event) {
              addCircle(event.latLng);
    });
    markerCluster.addMarker(offenderMarker);
      
    }
  }
});

  d3.csv("assets/data/publicschools.csv", function(data) {
    
    for(var i = 0; i < data.length; i++) {
      var longitude = parseFloat(data[i].longitude);
      var lat = parseFloat(data[i].latitude);
      var coord = [longitude, lat];
      if(coord[1] < 40.559 && coord[0] > -95.8
        && coord[1] > 35.7 && coord[0] < -88.9
        ) {
        var schoolMarker = new google.maps.Marker({
          position: {lat: coord[1], lng: coord[0]},
          icon: imageIcon,
          map: map
        });
       schoolPositions.push(schoolMarker.getPosition());

        if(map.getBounds().contains(schoolMarker.getPosition()))
        {
            schoolsInZoom.push(schoolMarker.position);
        } 

        schoolMarker.addListener('click', function(event) {
          addCircle(event.latLng);
      });
    markerClusterSchool.addMarker(schoolMarker); 
      

    }
  }

});

  d3.csv("assets/data/privateschools.csv", function(data) {
    for(var i = 0; i < data.length; i++) {
      var longitude = parseFloat(data[i].longitude);
      var lat = parseFloat(data[i].latitude);
      var coord = [longitude, lat];
      if(coord[1] < 40.559 && coord[0] > -95.8
        && coord[1] > 35.7 && coord[0] < -88.9
        ) {
        var schoolMarker = new google.maps.Marker({
          position: {lat: coord[1], lng: coord[0]},
          icon: imageIcon,
          map: map
        });
        schoolPositions.push(schoolMarker.getPosition());
        if(map.getBounds().contains(schoolMarker.getPosition()))
          {
              schoolsInZoom.push(schoolMarker.position);
          } 

        schoolMarker.addListener('click', function(event) {
          addCircle(event.latLng); 
      });
    markerClusterSchool.addMarker(schoolMarker);
    }
  }

});

  d3.csv("assets/data/childcarefacilities.csv", function(data) {
    for(var i = 0; i < data.length; i++) {
      var longitude = parseFloat(data[i].longitude);
      var lat = parseFloat(data[i].latitude);
      var coord = [longitude, lat];
      if(coord[1] < 40.559 && coord[0] > -95.8
        && coord[1] > 35.7 && coord[0] < -88.9
        ) {
        var schoolMarker = new google.maps.Marker({
          position: {lat: coord[1], lng: coord[0]},
          icon: imageIcon,
          map: map
        });
        schoolPositions.push(schoolMarker.getPosition());
        if(map.getBounds().contains(schoolMarker.getPosition()))
        {
            schoolsInZoom.push(schoolMarker.position);
        } 

        schoolMarker.addListener('click', function(event) {
          addCircle(event.latLng);
      });
    markerClusterSchool.addMarker(schoolMarker);
     
    }
  }
  
});
  

  this.onPan();
  document.body.appendChild(this.svg);
  this.map.addListener('center_changed', this.onPan);
}
SVGOverlay.prototype.changeRadius = function(newRadius) {
  currentCircleRadius = newRadius;
  for(var i = 0; i < offenderCircles.length; i++) {
    offenderCircles[i].setRadius(newRadius);
  }
}

SVGOverlay.prototype.onPan = function() {
  offendersInZoom = new Array();
  for(var i = 0; i < markerPositions.length; i++) {
    if(map.getBounds().contains(markerPositions[i])) {
      offendersInZoom.push(markerPositions[i]);
    }
  }

  schoolsInZoom = new Array();
  for(var i = 0; i < schoolPositions.length; i++) {
    if(map.getBounds().contains(schoolPositions[i])) {
      schoolsInZoom.push(schoolPositions[i]);
    }
  }
  visibleTracts = new Array();
  for(var i = 0; i < tractCentroids.length; i++) {
    if(map.getBounds().contains(tractCentroids[i])) {
      visibleTracts.push(i);
    }
  }
};

SVGOverlay.prototype.onRemove = function () {
  this.map.removeListener('center_changed', this.onPan);
  this.svg.parentNode.removeChild(this.svg);
  this.svg = null;
};

SVGOverlay.prototype.setOffenderPolygonVisibilities = function(offenderPolygonsVisible) {
  displayOffenderDensities = offenderPolygonsVisible;
  if(offenderPolygonsVisible) {
    document.getElementById("offenderGradientDiv").style.visibility='visible';
    for (var i = 0; i < offenderDensityPolygons.length; i++) {
      offenderDensityPolygons[i].setMap(map);
    }
  }
  else {
    document.getElementById("offenderGradientDiv").style.visibility='hidden';
    for (var i = 0; i < offenderDensityPolygons.length; i++) {
      offenderDensityPolygons[i].setMap(null);
    }
  }
}


SVGOverlay.prototype.draw = function () {
  offendersInZoom = new Array();
  schoolsInZoom = new Array();
  visibleTracts = new Array();
 var colorScale = d3.scaleLinear().domain([visMin,visMax]).range(["##ffe6e6","#990000"]);
 for (var i = 0; i < tractMarkers.length; i++) {
  tractMarkers[i].setMap(null);
  offenderDensityPolygons[i].setMap(null);
  }
  tractMarkers = [];
  offenderDensityPolygons = [];

  this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  this.svg.style.position = 'absolute';
  this.svg.style.top = 0;
  this.svg.style.left = 0;
  this.svg.style.width = $('#heatMapContainer').width();
  this.svg.style.height = $('#heatmap').height();
  this.svg.style.pointerEvents = 'none';
  layer = d3.select(this.getPanes().overlayLayer).append("div");

  var bounds = this.map.getBounds(),
  center = bounds.getCenter(),
  ne = bounds.getNorthEast(),
  sw = bounds.getSouthWest();
  var topRight = this.map.getProjection().fromLatLngToPoint(this.map.getBounds().getNorthEast());
  var bottomLeft = this.map.getProjection().fromLatLngToPoint(this.map.getBounds().getSouthWest());
  var scale = Math.pow(2, this.map.getZoom());

  var proj = this.map.getProjection();



  g = layer.append("svg")
  .attr('width', width)
  .attr('height', height);

  d3.json("assets/data/mo.json", function(error, data) {
    if (error) throw error;

    var simplifyTolerace = 0.0008;
    var newdata = [];
    var i = 0;
    data.features.forEach(function(d) {
      var points = d.geometry.coordinates[0];
      newpoints = simplify(points,simplifyTolerace,false);
      i+=1; 

      d.geometry.coordinates[0] = newpoints;
    });
    mapdata = data;
    
    var colorScale = d3.scaleLinear().domain([visMin,visMax]).range(["#ffffff","#a30000"]);
    var offenderDensityColorScale = d3.scaleLinear().domain([offenderRateMin,offenderRateMax]).range(["#f0f8ff","#191970"]);


    var addListenersOnPolygon = function(polygon) {
        google.maps.event.addListener(polygon, 'click', function (event) {
          selectedTractIndex = polygon.index;
          findSchoolOffenderDistances(polygon);
        });  
      }

    for(i = 0; i < mapdata.features.length; i++) {
      var currentCoords = mapdata.features[i].geometry.coordinates[0];
      var polygonCoords = [];
      var latAvg = 0.0;
      var lngAvg = 0.0;
      for(j = 0; j < currentCoords.length; j++) {
        latAvg += currentCoords[j][1];
        lngAvg += currentCoords[j][0];
        polygonCoords.push({lat: currentCoords[j][1], lng: currentCoords[j][0]});
      }
      latAvg /= currentCoords.length;
      lngAvg /= currentCoords.length;
      var tractPolygon = new google.maps.Polygon({
        paths: polygonCoords,
        strokeWeight: 1,
        strokeOpacity: 0.8,
        fillColor: colorScale(visualizedTraitList[i]),
        fillOpacity: 0.5,
        index: i
      });


      if(map.getBounds().contains(tractCentroids[i]))
      {
        visibleTracts.push(i);
      }

      tractMarkers.push(tractPolygon);

      var boundaryPath = [];
      for(j = 0; j < currentCoords.length; j++) {
        boundaryPath.push({lat: (currentCoords[j][1]+latAvg)/2.0, lng: (currentCoords[j][0]+lngAvg)/2.0});
      }
      var tractOffenderPolygon = new google.maps.Polygon({
        paths: boundaryPath,
        strokeWeight: 0,
        strokeOpacity: 1.0,
        fillColor: offenderDensityColorScale(offenderDensities[i]),
        fillOpacity: 1.0,
        map: map,
        index: i
      });
      offenderDensityPolygons.push(tractOffenderPolygon);

    }

    for (var i = 0; i < tractMarkers.length; i++) {
      tractMarkers[i].setMap(map);
      addListenersOnPolygon(tractMarkers[i]);
      if(displayOffenderDensities) {
        offenderDensityPolygons[i].setMap(map);
      }
      else {
        offenderDensityPolygons[i].setMap(null);
      }

      addListenersOnPolygon(offenderDensityPolygons[i]);
    }


  });
  //visibleTractIndices = new int[visibleTractIndices.length];
  //for(var i = 0; i < visibleTracts.length; i++) {
    //visibleTractIndices[i] = visibleTracts[i];
  //}

  for(var i = 0; i < markerPositions.length; i++) {
    if(map.getBounds().contains(markerPositions[i])) {
      offendersInZoom.push(markerPositions[i]);
    }
  }
  for(var i = 0; i < schoolPositions.length; i++) {
    if(map.getBounds().contains(schoolPositions[i])) {
      schoolsInZoom.push(schoolPositions[i]);
    }
  }
  //this.onPan();
  document.body.appendChild(this.svg);
  //this.map.addListener('center_changed', this.onPan);
};




fetch('map-styles.json')
.then((response) => response.json());
overlay = new SVGOverlay(map);

$("#offenderDensity").on("click", function() {
  offenderDensitySelected = true;
  document.getElementById("currentDemographic").innerHTML= "Sex offender population density";
  $("#offenderDensityCheckbox").attr("disabled", true);
  overlay.setOffenderPolygonVisibilities(false);
  if ($(this).attr("data-tog") == "0"){
    visMin = offenderRateMin;
    visMax = offenderRateMax;
    document.getElementById("demographicMin").innerHTML=visMin;
    document.getElementById("demographicMax").innerHTML=visMax;
    visualizedTraitList = offenderDensities;
    overlay.draw();
    $(this).attr("data-tog", "1")
    $(this).attr("style", 'background-color:#e0e2e5' );
    $(this).siblings().attr("style", 'background-color:#fff' );
    $(this).siblings().attr("data-tog", "0");
  }
});

$("#bdegree").on("click",function() {
  offenderDensitySelected = false;
  document.getElementById("currentDemographic").innerHTML= "Percent with a bachelor's degree";
  $('#offenderDensityCheckbox').removeAttr("disabled");
  overlay.setOffenderPolygonVisibilities($('#offenderDensityCheckbox').is(':checked'));
  if ($(this).attr("data-tog") == "0"){
    visMin = educationRateMin;
    visMax = educationRateMax;
    document.getElementById("demographicMin").innerHTML=visMin;
    document.getElementById("demographicMax").innerHTML=visMax;
    visualizedTraitList = educationRates;
    overlay.draw();
    $(this).attr("data-tog", "1")
    $(this).attr("style", 'background-color:#e0e2e5' );
    $(this).siblings().attr("style", 'background-color:#fff' );
    $(this).siblings().attr("data-tog", "0");
  }
});

$("#fstamps").on("click", function() {
  offenderDensitySelected = false;
  document.getElementById("currentDemographic").innerHTML= "Percent receiving food stamps";
  $('#offenderDensityCheckbox').removeAttr("disabled");
  overlay.setOffenderPolygonVisibilities($('#offenderDensityCheckbox').is(':checked'));
  if ($(this).attr("data-tog") == "0"){
    visMin = publicRateMin;
    visMax = publicRateMax;
    document.getElementById("demographicMin").innerHTML=visMin;
    document.getElementById("demographicMax").innerHTML=visMax;
    visualizedTraitList = publicRates;
    overlay.draw();
    $(this).attr("data-tog", "1")
    $(this).attr("style", 'background-color:#e0e2e5' );
    $(this).siblings().attr("style", 'background-color:#fff' );
    $(this).siblings().attr("data-tog", "0");
  }
});


$("#medIncome").on("click", function() {
  offenderDensitySelected = false;
  document.getElementById("currentDemographic").innerHTML= "Median income";
  $('#offenderDensityCheckbox').removeAttr("disabled");
  overlay.setOffenderPolygonVisibilities($('#offenderDensityCheckbox').is(':checked'));
  if ($(this).attr("data-tog") == "0"){
    //readIncome();
    visMin = incomeMin;
    visMax = incomeMax;
    document.getElementById("demographicMin").innerHTML=visMin;
    document.getElementById("demographicMax").innerHTML=visMax;
    visualizedTraitList = medianIncomes;
    overlay.draw();
    $(this).attr("data-tog", "1")
    $(this).attr("style", 'background-color:#e0e2e5' );
    $(this).siblings().attr("style", 'background-color:#fff' );
    $(this).siblings().attr("data-tog", "0");
  }
});

$("#healthRate").on("click", function() {
  offenderDensitySelected = false;
  document.getElementById("currentDemographic").innerHTML= "Percent without health insurance";
  $('#offenderDensityCheckbox').removeAttr("disabled");
  overlay.setOffenderPolygonVisibilities($('#offenderDensityCheckbox').is(':checked'));
  if ($(this).attr("data-tog") == "0"){
    //readHealth();
    visMin = healthRateMin;
    visMax = healthRateMax;
    document.getElementById("demographicMin").innerHTML=visMin;
    document.getElementById("demographicMax").innerHTML=visMax;
    visualizedTraitList = healthRates;
    overlay.draw();
    $(this).attr("data-tog", "1")
    $(this).attr("style", 'background-color:#e0e2e5' );
    $(this).siblings().attr("style", 'background-color:#fff' );
    $(this).siblings().attr("data-tog", "0");
  }
});

$("#povertyRate").on("click", function() {
  offenderDensitySelected = false;
  document.getElementById("currentDemographic").innerHTML= "Poverty rate";
  $('#offenderDensityCheckbox').removeAttr("disabled");
  overlay.setOffenderPolygonVisibilities($('#offenderDensityCheckbox').is(':checked'));
  if ($(this).attr("data-tog") == "0"){
    //readPoverty();
    visMin = povertyMin;
    visMax = povertyMax;
    document.getElementById("demographicMin").innerHTML=visMin;
    document.getElementById("demographicMax").innerHTML=visMax;
    visualizedTraitList = povertyRates;
    overlay.draw();
    $(this).attr("data-tog", "1")
    $(this).attr("style", 'background-color:#e0e2e5' );
    $(this).siblings().attr("style", 'background-color:#fff' );
    $(this).siblings().attr("data-tog", "0");
  }
});

$("#fhhRate").on("click", function() {
  offenderDensitySelected = false;
  document.getElementById("currentDemographic").innerHTML= "Percent female-headed households";
  $('#offenderDensityCheckbox').removeAttr("disabled");
  overlay.setOffenderPolygonVisibilities($('#offenderDensityCheckbox').is(':checked'));
  if ($(this).attr("data-tog") == "0"){
    visMin = fhhMin;
    visMax = fhhMax;
    document.getElementById("demographicMin").innerHTML=visMin;
    document.getElementById("demographicMax").innerHTML=visMax;
    visualizedTraitList = fhhs;
    overlay.draw();
    $(this).attr("data-tog", "1")
    $(this).attr("style", 'background-color:#e0e2e5' );
    $(this).siblings().attr("style", 'background-color:#fff' );
    $(this).siblings().attr("data-tog", "0");
  }
});

$("#hhSize").on("click", function() {
  offenderDensitySelected = false;
  $('#offenderDensityCheckbox').removeAttr("disabled");
  document.getElementById("currentDemographic").innerHTML= "Percent household sizes > 4";
  overlay.setOffenderPolygonVisibilities($('#offenderDensityCheckbox').is(':checked'));
  if ($(this).attr("data-tog") == "0"){
    //readHHSizes();
    visMin = hhSizeMin;
    visMax = hhSizeMax;
    document.getElementById("demographicMin").innerHTML=visMin;
    document.getElementById("demographicMax").innerHTML=visMax;
    visualizedTraitList = hhSizes;
    overlay.draw();
    $(this).attr("data-tog", "1")
    $(this).attr("style", 'background-color:#e0e2e5' );
    $(this).siblings().attr("style", 'background-color:#fff' );
    $(this).siblings().attr("data-tog", "0");
  }
});

$("#under18Rate").on("click", function() {
  offenderDensitySelected = false;
  $('#offenderDensityCheckbox').removeAttr("disabled");
  document.getElementById("currentDemographic").innerHTML= "Percent under 18";
  overlay.setOffenderPolygonVisibilities($('#offenderDensityCheckbox').is(':checked'));
  if ($(this).attr("data-tog") == "0"){
    //readUnder18();
    visMin = u18Min;
    visMax = u18Max;
    document.getElementById("demographicMin").innerHTML=visMin;
    document.getElementById("demographicMax").innerHTML=visMax;
    visualizedTraitList = under18s;
    overlay.draw();
    $(this).attr("data-tog", "1")
    $(this).attr("style", 'background-color:#e0e2e5' );
    $(this).siblings().attr("style", 'background-color:#fff' );
    $(this).siblings().attr("data-tog", "0");
  }
});

};

$('#radiusSlider').mousemove(function (){
        document.getElementById("circleRadius").innerHTML=this.value*(1000/40);
        circleRadiusValue = document.getElementById("circleRadius").innerHTML;
        var feetToMeters = parseFloat(circleRadiusValue) * 0.3048;
        if(overlay != null) {
          overlay.changeRadius(feetToMeters);
        }
});

$('#offenderDensityCheckbox').click(function() {
  overlay.setOffenderPolygonVisibilities($('#offenderDensityCheckbox').is(':checked'));

});
