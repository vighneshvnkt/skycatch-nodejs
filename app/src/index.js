var request = require('request');
var async = require('async');
var https = require('https');
var axios = require('axios');
var ExifImage = require('exif').ExifImage;
var polygon = require('polygon');
var csv = require('fast-csv');
var csvData = [];
var latArray = []; //array of latitudes of images
var lonArray = []; //array of longitude of images
var latControlPoints = []; //list of latitude of control points
var lonControlPoints = []; //list of longitude of control points
var controlPointName = []; //list of name of control points
var results = {}; //JSON file of results that can be persisted and returned to the user
//var fs = require('fs');
var jsonfile = require('jsonfile')
var file = 'resultJSON.json';

//list of image links (ideally should be obtained using aws-sdk listObjectsV2/getObject)
var randoms = [
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868761000_images_20171013042440_IMG_0000.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868764000_images_20171013042440_IMG_0001.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868767000_images_20171013042440_IMG_0002.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868777000_images_20171013042440_IMG_0005.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868780000_images_20171013042440_IMG_0006.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868783000_images_20171013042440_IMG_0007.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868786000_images_20171013042440_IMG_0008.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868790000_images_20171013042440_IMG_0009.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868793000_images_20171013042440_IMG_0010.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868796000_images_20171013042440_IMG_0011.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868799000_images_20171013042440_IMG_0012.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868803000_images_20171013042440_IMG_0013.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868806000_images_20171013042440_IMG_0014.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868809000_images_20171013042440_IMG_0015.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868812000_images_20171013042440_IMG_0016.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868815000_images_20171013042440_IMG_0017.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868818000_images_20171013042440_IMG_0018.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868821000_images_20171013042440_IMG_0019.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868825000_images_20171013042440_IMG_0020.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868828000_images_20171013042440_IMG_0021.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868831000_images_20171013042440_IMG_0022.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868834000_images_20171013042440_IMG_0023.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868837000_images_20171013042440_IMG_0024.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868840000_images_20171013042440_IMG_0025.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868843000_images_20171013042440_IMG_0026.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868847000_images_20171013042440_IMG_0027.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868850000_images_20171013042440_IMG_0028.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868853000_images_20171013042440_IMG_0029.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868856000_images_20171013042440_IMG_0030.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868859000_images_20171013042440_IMG_0031.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868862000_images_20171013042440_IMG_0032.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868865000_images_20171013042440_IMG_0033.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868865000_images_20171013042440_IMG_0034.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868872000_images_20171013042440_IMG_0035.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868875000_images_20171013042440_IMG_0036.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868878000_images_20171013042440_IMG_0037.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868881000_images_20171013042440_IMG_0038.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868884000_images_20171013042440_IMG_0039.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868888000_images_20171013042440_IMG_0040.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868891000_images_20171013042440_IMG_0041.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868894000_images_20171013042440_IMG_0042.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868897000_images_20171013042440_IMG_0043.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868900000_images_20171013042440_IMG_0044.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868903000_images_20171013042440_IMG_0045.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868906000_images_20171013042440_IMG_0046.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868910000_images_20171013042440_IMG_0047.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868913000_images_20171013042440_IMG_0048.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868916000_images_20171013042440_IMG_0049.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868919000_images_20171013042440_IMG_0050.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868922000_images_20171013042440_IMG_0051.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868925000_images_20171013042440_IMG_0052.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868928000_images_20171013042440_IMG_0053.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868931000_images_20171013042440_IMG_0054.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868935000_images_20171013042440_IMG_0055.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868938000_images_20171013042440_IMG_0056.jpg ',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868941000_images_20171013042440_IMG_0057.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868944000_images_20171013042440_IMG_0058.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868947000_images_20171013042440_IMG_0059.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868950000_images_20171013042440_IMG_0060.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868953000_images_20171013042440_IMG_0061.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868956000_images_20171013042440_IMG_0062.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868960000_images_20171013042440_IMG_0063.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868963000_images_20171013042440_IMG_0064.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868966000_images_20171013042440_IMG_0065.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868969000_images_20171013042440_IMG_0066.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868972000_images_20171013042440_IMG_0067.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868975000_images_20171013042440_IMG_0068.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868979000_images_20171013042440_IMG_0069.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868982000_images_20171013042440_IMG_0070.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868985000_images_20171013042440_IMG_0071.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868988000_images_20171013042440_IMG_0072.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868991000_images_20171013042440_IMG_0073.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868994000_images_20171013042440_IMG_0074.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868997000_images_20171013042440_IMG_0075.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869000000_images_20171013042440_IMG_0076.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869003000_images_20171013042440_IMG_0077.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869007000_images_20171013042440_IMG_0078.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869010000_images_20171013042440_IMG_0079.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869013000_images_20171013042440_IMG_0080.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869016000_images_20171013042440_IMG_0081.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869019000_images_20171013042440_IMG_0082.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869022000_images_20171013042440_IMG_0083.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869026000_images_20171013042440_IMG_0084.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869029000_images_20171013042440_IMG_0085.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869032000_images_20171013042440_IMG_0086.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869035000_images_20171013042440_IMG_0087.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869038000_images_20171013042440_IMG_0088.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869041000_images_20171013042440_IMG_0089.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869044000_images_20171013042440_IMG_0090.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869047000_images_20171013042440_IMG_0091.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869051000_images_20171013042440_IMG_0092.jpg',
'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507869054000_images_20171013042440_IMG_0093.jpg'
];


var count = randoms.length; //count of images in s3 bucket
//console.log(count);
var i = 0;


//function loopRandom(random){
for (const item of randoms) {
  cb(item); //callback images to fetch latitude and longitude and perform further operations
}
//}

//callback to fetch lat and lon from an s3 image and append to array
function cb(url){
 /*
 input @param {String} url - The image URL to fetch GPS data
 */
  //var latlon = [];
  https.get(url, (res) => {
   res.on('data', (d) => {
    //console.log(url);
    //console.log(JSON.stringify(d));
    //performD(d);
          try {

     //fetch gps lat and lon from exif of image data retrieved from URL
    new ExifImage({ image : d }, function (error, exifData) {
        if (error){
          // console.log('Error: '+error.message);
        }
        else{
           i++;
           console.log('Image no : ', i);
          //console.log(exifData['gps']['GPSLatitude']); // Do something with your data!
          lat = exifData['gps']['GPSLatitude'];
          latitude = lat[0] + (lat[1]/60) + (lat[2]/3600); //convert minutes and seconds to decimal
          console.log('Latitude : ', latitude);

          lon = exifData['gps']['GPSLongitude'];
          longitude = lon[0] + (lon[1]/60) + (lon[2]/3600); //convert minutes and seconds to decimal
          console.log('Longitude : ', longitude);

          //altitude = exifData['gps']['GPSAltitude']; //not required

          //append to array synchronously
          latArray.push(latitude);
          lonArray.push(longitude);

          //latlon.push(latitude);
          //latlon.push(longitude);
          //console.log(latlon);
          console.log();

          //after last image is read, get control points from CSV
          if(i == count){
            var stream = request('https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/controlpoints/controlPoints.csv');
            read_csv_from_url(stream); //read CSV from link
          }
          //return latlon;
          //latlon.push(lats);
          //console.log(latlon);
          //return latlon;
          //randoms.push(latitude);
        }
    });
    //console.log('var myimage is' +myimage);
} catch (error) {
    //console.log('Error: ' + error.message);
}
  });

}).on('error', (e) => {
  //console.error(e);
});
//console.log(latArray);
//console.log(latlon);
//return latlon;
  }



//find minimum and maximum from array (ideally a float of latitudes or longitudes)
function findMinMax(arr) {
/*
  @param {Array} arr - Array of 1D floats containing either latitude or longitude
  @returns {Array} [min,max] - An array of float containing minimum and maximum values of input arr
  */
  let min = arr[0], max = arr[0]; //initialize min and max

  for (let i = 1, len=arr.length; i < len; i++) {
    let v = arr[i];
    min = (v < min) ? v : min;
    max = (v > max) ? v : max;
  }

  return [min, max]; //return min and max
}

//read CSV data from input stream
function read_csv_from_url(stream) {
 /*
  @param {String} stream - A return of request of a particular URL consisting CSV data of control points
  */
csv.fromStream(stream)
 .on("data", function(data){
  controlPointName.push(data[0]); //contains control point name
     latControlPoints.push(data[2]); //contains latitude of control point
     lonControlPoints.push(data[3]); //contains longitude of control point
 })
 .on("end", function(){
     printLatAndLon(); //process GPS data and control points
 });
}



function isInside(geodata, controlLat, controlLon){
  var liesInside = false;
  //Ref : https://github.com/substack/point-in-polygon/blob/master/index.js
  //var inside = false;
    for (var m = 0, n = geodata[0].length - 1; m < geodata[0].length; n = m++) {
        var latI = geodata[0][m], lonI = geodata[1][m];
        var latJ = geodata[0][n], lonJ = geodata[1][n];
        var intersect = ((lonI > controlLon) != (lonJ > controlLon))
            && (controlLat < (latJ - latI) * (controlLon - lonI) / (lonJ - lonI) + latI);
        if (intersect) {liesInside = !liesInside};
    }

    //return inside;
  /*var geoCount = 0;;
  var lessLat = 0;
  var greaterLat = 0;
  var lessLon = 0;
  var greaterLon = 0;
  while(geoCount < geodata[0].length){
  	if(geodata[1][geoCount] == controlLon && geodata[0][geoCount] < controlLat){
  		lessLat++;
  	}
  	else if(geodata[1][geoCount] == controlLon && geodata[0][geoCount] > controlLat){
  		greaterLat++;
  	}
  	else if(geodata[0][geoCount] == controlLat && geodata[1][geoCount] < controlLon){
  		lessLon++;
  	}
  	else if(geodata[0][geoCount] == controlLat && geodata[1][geoCount] > controlLon){
  		greaterLon++;
  	}
  	if(lessLat > 0 && greaterLat > 0 && lessLon > 0 && greaterLon > 0){
  		liesInside = true;
  	}
    geoCount++;
  }*/
  return liesInside;
}

//function to create rectangular bounds of drone flight area
function evaluateControlPoints(geodata,minMaxData,controlPointsData){
/*
  @param {String} geodata - GPS data of 92 latitudes and longitudes in a 2D array[92 lats,92 lons]
  @param {String} minMaxData - GPS data of min and max lats and lons in a 2D array[[minLat,maxLat],[minLon,maxLon]]
  @param {String} controlPointsData - 5 control points datain a 3D array[5 names, 5 lats, 5 lons]
  */
    //console.log(geodata[0].length); //2D array of lat and lon[92,92]
  console.log('Minimum and maximum latitudes and longitudes : ',minMaxData); //2D array of min and max lat and lon[2,2]
  console.log('Control points : ',controlPointsData); //3D array of control points name lat and lon[5,5,5]
  var k = 0;
  while(k < controlPointsData[0].length){
    var latCount = 0;
    var lonCount = 0;
    if(controlPointsData[1][k] < minMaxData[0][0] ||
      controlPointsData[1][k] > minMaxData[0][1] ||
      controlPointsData[2][k] < minMaxData[1][0] ||
      controlPointsData[2][k] > minMaxData[1][1]){
      results[controlPointsData[0][k]] = false;
      //continue;
    }
    else{
    		results[controlPointsData[0][k]] = true;
    		//lies inside algorithm required only if shape needs to be closed from all 4 sides
          //results[controlPointsData[0][k]] = isInside(geodata,controlPointsData[1][k],controlPointsData[2][k]);

    }
    k++;
  }
  console.log('Results : ',results); //results is a JSON file that can be persisted and returned to user

  jsonfile.writeFileSync(file, results);

  //var json = JSON.stringify(results);
 /* fs.writeFile('resultJSON.json', json,'utf-8',function(err){
	if(err) throw err;
	console.log('complete');
	}); */
}

//function to clean control point and image data
function printLatAndLon(){
  //remove headers from CSV
  controlPointName.splice(0,1);
  latControlPoints.splice(0,1);
  lonControlPoints.splice(0,1);
  //console.log(latControlPoints);
  //console.log(lonControlPoints);

  var geodata = [latArray, lonArray]; //GPS data from images
  var controlPointsData = [controlPointName, latControlPoints, lonControlPoints]; //control points data
  var minMaxLat = findMinMax(latArray); //find minimum and maximum latitude
  var minMaxLon = findMinMax(lonArray);  //find minimum and maximum longitude
  var minMaxData = [minMaxLat,minMaxLon]; //min and max lat and lon data

  evaluateControlPoints(geodata,minMaxData,controlPointsData); //create bounds of drone flight path


//Initially tried using default libraries and hardcoded data of control points
 /* var controlPoint1 = [42.60325102, 142.0836789];
  var controlPoint2 = [42.60308422, 142.0837981];
  var controlPoint3 = [42.60290405, 142.0833526];
  var controlPoint4 = [42.6029125, 142.0828338];
  var controlPoint5 = [42.60200375, 142.083355];*/
  //console.log(latArray.length);
  //console.log(lonArray.length);
/*  console.log(Math.min(latArray));
  console.log(Math.max(latArray));
    console.log(Math.min(lonArray));
  console.log(Math.max(lonArray));*/
  //var p = new polygon(data);
/*  var contains1 = p.containsPoint(controlPoint1);
  console.log(contains1);
 var contains2 = p.containsPoint(controlPoint2);
  console.log(contains2);
 var contains3 = p.containsPoint(controlPoint3);
  console.log(contains3);
 var contains4 = p.containsPoint(controlPoint4);
  console.log(contains4);
 var contains5 = p.containsPoint(controlPoint5);
  console.log(contains5);*/


//attempt to plot path in cmd
/*  var g1 = new CliGraph({ height: 25, width: 25 });
  for(var j in latArray){
    console.log(latArray[j]);
    g1.addPoint(latArray[j]/10,lonArray[j]/10, '+');
  }
  console.log(g1.toString());*/
  //Plotly.newPlot('myDiv', data);
  //console.log(lonArray);
  return process.exit();
}

//failed attempt at using object oriented programming to store csv data in objects arraylist

/*function myControlPoints(name,lat,lon) {
    this.FieldOne = Fone;
    this.FieldTwo = Ftwo;
    this.FieldThree = Fthree;
}; */

/*csv.parse('https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/controlpoints/controlPoints.csv',function (data) {
    for (var index = 0; index < data.length; index++) {
        csvData.push(new myControlPoints(data[index][0], data[index][1], data[index][2]));
    }
});*/



//Trial and error with AWS-DK and other image libraries to fetch exif data and csv data
//Trial and error with promises, callbacks, async and await


//const AWS = require('aws-sdk');
//var knox = require('knox');
//var express = require('express');
//var parseEXIF = require('exif').ExifImage;
//var parseXML = require('xml2js').parseString;
//var asyncLoop = require('node-async-loop');
//const ExifReader = require('exifreader');
//global.DataView = require('jdataview')
//var EXIF = require('exif-js');
//var Plotly = require('plotly');
//var CliGraph = require("cli-graph");
//var functionPlot = require('function-plot');
//var fastexif = require('fast-exif');
/*img1 = 'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868786000_images_20171013042440_IMG_0008.jpg'
EXIF.getData(img1, function() {
        var make = EXIF.getData(this, "GPS");
        console.log(make);
    });*/
//var csvObj = csv.csv();
//results['mykey'] = 'myvalue';
//var altArray = [];
//var moreImages = true;
//var latlon = new Array();


/*var s3 = new AWS.S3();
AWS.config.update({
    accessKeyId: null,
    secretAccessKey: null
});
*///var params = { Bucket: 's3:\skycatch-engineering-challenges'};

/*var params = {
  Bucket: "s3:\skycatch-engineering-challenges",
  Key: "201807-platform-validate-control-points\images\1507868786000_images_20171013042440_IMG_0008.jpg"
 };
 s3.getObject(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
 });*/

/* s3.listObjects(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
 });*/

/*var client = knox.createClient({
   bucket: 's3:\skycatch-engineering-challenges'
});*/



//generate URLs and store in array randoms
/*while(count <99){
  var random = (count > 9)?('00'+count) :('000' + count);
  var url = 'https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868786000_images_20171013042440_IMG_' + random +'.jpg'
  randoms.push(url);
  //console.log(random);
  //Promise(cb(url));
  count = count + 1;
}*/
//console.log(randoms);

//console.log(https.get('https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/*'))

//randoms.forEach(u => cb(u));



//loopRandom(randoms);
//console.log(latlon);
//console.log(latArray);
//asyncLoop(randoms, cb);

/*responses = []

async function executeRandom(){
	for(var random in randoms){
		await cb(randoms[random]);
	}
}

executeRandom();*/
//console.log(responses);


/*function URLfetch(url){
	try{
		return https.get(url);
	}
	catch(error){

	}
}*/

/*datas = []
for(response in responses){
	datas.push(collectResponse(responses[response]))
}
console.log(datas);
*/

/*function collectResponse(response){
	try{
		return response.on('data',collectExif(data));
	}
	catch(error){

	}
}

function collectExif(data){
	try{
		return ExifImage({image : data},function (error, exifData) {
        		if (error){
        			//console.log('Error: '+error.message);
        		}

        		else{
        			//console.log(exifData['gps']['GPSLatitude']); // Do something with your data!
        			lat = exifData['gps']['GPSLatitude'];
        			latitude = lat[0] + (lat[1]/60) + (lat[2]/3600);
        			console.log(latitude);
        			lon = exifData['gps']['GPSLongitude'];
        			longitude = lon[0] + (lon[1]/60) + (lon[2]/3600);
        			console.log(longitude);
        			altitude = exifData['gps']['GPSAltitude'];
        			//latitude = lat[0] + (lat[1]/60) + (lat[2]/3600);
        			console.log(altitude);

        		}

    		});
		} catch (error) {
    		//console.log('Error: ' + error.message);
		}
	}*/

/*for(var random in randoms){
	https.get(randoms[random],function(res)
	{
		   res.on('data', function(d) {
    		//console.log(JSON.stringify(d));
    		try {
    			ExifImage({ image : d }, function (error, exifData) {
        		if (error){
        			//console.log('Error: '+error.message);
        		}

        		else{
        			//console.log(exifData['gps']['GPSLatitude']); // Do something with your data!
        			lat = exifData['gps']['GPSLatitude'];
        			latitude = lat[0] + (lat[1]/60) + (lat[2]/3600);
        			console.log(latitude);
        			lon = exifData['gps']['GPSLongitude'];
        			longitude = lon[0] + (lon[1]/60) + (lon[2]/3600);
        			console.log(longitude);
        			altitude = exifData['gps']['GPSAltitude'];
        			//latitude = lat[0] + (lat[1]/60) + (lat[2]/3600);
        			console.log(altitude);

        		}

    		});
		} catch (error) {
    		//console.log('Error: ' + error.message);
		}
  	});

	}).on('error', (e) => {
  //console.error(e);
});
	}
*/
/*function cb(url){

	axios.get(url).then(function(response) {
   return response.data }).then(function(response.data){
   	console.log(url);
    //console.log(JSON.stringify(d));
    try {
    new ExifImage({ image : d }, function (error, exifData) {
        if (error){
        	//console.log('Error: '+error.message);
        }

        else{
        	//console.log(exifData['gps']['GPSLatitude']); // Do something with your data!
        	lat = exifData['gps']['GPSLatitude'];
        	latitude = lat[0] + (lat[1]/60) + (lat[2]/3600);
        	console.log(latitude);
        	lon = exifData['gps']['GPSLongitude'];
        	longitude = lon[0] + (lon[1]/60) + (lon[2]/3600);
        	console.log(longitude);
        	altitude = exifData['gps']['GPSAltitude'];
        	//latitude = lat[0] + (lat[1]/60) + (lat[2]/3600);
        	console.log(altitude);

        }

    });
} catch (error) {
    //console.log('Error: ' + error.message);
}
  });

}
*/



/*var results = [];
var config = JSON.parse(queries);
for (var key in config) {
    var query = config[key].query;
    search(query, function(result) {
        results.push(result);
    });
}
res.writeHead( ... );
res.end(results);
*/

/*var count = 99;
const times = x => f => {
  if (x > 0) {
    f()
    times (x - 1) (f)
  }
}

times (count) (() => {
	var random = (count > 9)?('00'+count) :('000' + count);
  	console.log(random);
	cb(random);
}

	)
*//*while(moreImages){
	console.log(count);
	var random = (count > 9)?('00'+count) :('000' + count);
	cb(random);
 	count = count + 1;
 if(count > 100){
 	break;
 }
}*/


/*
function getImageData(res){
	//console.log(res);
	 async res.on('data', (d) => {
    //console.log(JSON.stringify(d));
    try {
    await new ExifImage({ image : d }, function (error, exifData) {
        if (error){
        	//console.log('Error: '+error.message);
        }

        else{
        	//console.log(exifData['gps']['GPSLatitude']); // Do something with your data!
        	lat = exifData['gps']['GPSLatitude'];
        	latitude = lat[0] + (lat[1]/60) + (lat[2]/3600);
        	console.log(latitude);
        	lon = exifData['gps']['GPSLongitude'];
        	longitude = lon[0] + (lon[1]/60) + (lon[2]/3600);
        	console.log(longitude);
        	altitude = exifData['gps']['GPSAltitude'];
        	//latitude = lat[0] + (lat[1]/60) + (lat[2]/3600);
        	console.log(altitude);

        }

    });
} catch (error) {
    //console.log('Error: ' + error.message);
}
  });
}*/




/*function performD(d){
	    try {
    new ExifImage({ image : d }, function (error, exifData) {
        if (error){
        	//console.log('Error: '+error.message);
        }
        else{
        	//console.log(exifData['gps']['GPSLatitude']); // Do something with your data!
        	lat = exifData['gps']['GPSLatitude'];
        	latitude = lat[0] + (lat[1]/60) + (lat[2]/3600);
        	console.log(latitude);
        	lon = exifData['gps']['GPSLongitude'];
        	longitude = lon[0] + (lon[1]/60) + (lon[2]/3600);
        	console.log(longitude);
        	altitude = exifData['gps']['GPSAltitude'];
        	//latitude = lat[0] + (lat[1]/60) + (lat[2]/3600);
        	console.log(altitude);
          return latitude;
        	//randoms.push(latitude);
        }
    });
} catch (error) {
    //console.log('Error: ' + error.message);
}
}
*/
/*https.get('https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868786000_images_20171013042440_IMG_0008.jpg').on('response', function(res){
  console.log(res.statusCode);
  //console.log(res);
  res.setEncoding('utf8');
  res.on('data', function(chunk){
  	console.log(chunk.toString('ascii'));
} catch (error) {
    console.log('Error: ' + error.message);
}
  });
}).end();*/

/*s3.listObjectsV2(params, function (err, data) {
  if(err) console.log(err.message);
  console.log(data);
});*/

/*var getParams = {
    Bucket: 's3:\\skycatch-engineering-challenges', // your bucket name,
    Key: '201807-platform-validate-control-points\images\1507868761000_images_20171013042440_IMG_0000.jpg' // path to the object you're looking for
}

s3.getObject(getParams, function(err, data) {
    // Handle any error and exit
    if (err)
        console.log(err.message);

  // No error happened
  // Convert Body from a Buffer to a String

  var objectData = data.Body.toString('utf-8'); // Use the encoding necessary
  console.log(objectData);
});*/

/*var allKeys = [];

function cb(mydata){
	console.log(mydata);
}
listAllKeys(true,cb);
function listAllKeys(token, cb)
{
  var opts = params;
  if(token) opts.ContinuationToken = token;

  s3.listObjectsV2(opts, function(err, data){
    allKeys = allKeys.concat(data);

    if(data!= null && data.IsTruncated)
      listAllKeys(data.NextContinuationToken, cb);
    else
      cb(data);
  });
}
*/
//getImagesFromXML('https://s3-us-west-2.amazonaws.com/skycatch-engineering-challenges/201807-platform-validate-control-points/images/1507868761000_images_20171013042440_IMG_0000.jpg');

/*function getImagesFromXML(url) {
  // Fetch the XML data
  console.log('Fetching XML...');

  request.get(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      // Parse the XML data
      console.log('Parsing XML...');
      //console.log(body);
      //body = body.toString('utf-8');
      console.log(body.toString('utf-8').replace("\ufeff", ""));
      parseXML(body.toString('utf-8').replace("\ufeff", ""), function(error, result) {
        if (!error) {
          // Store the parsed XML data into the images object
          images = result.ListBucketResult.Contents;

          // Make sure that we actually have the images
          if (images.length) {
            // Found images
            console.log('Images found:', images.length);

            // Start the next step
            getEXIFdata(url);
          } else {
            // Failed to find images
            console.log('No images found.');
            process.exit(1);
          }
        } else {
          // Failed to parse XML data
          console.log('Error parsing XML data:', error.message);
          process.exit(1);
        }
      });
    } else {
      // Failed to parse XML data
      console.log('Error fetching XML data:', error.message);
      process.exit(1);
    }
  });
}

function getEXIFdata(url) {
  console.log('Fetching EXIF data...');

  // Loop through the images
  async.reduce(images, "", function(memo, item, callback) {
    var fileName = item.Key[0];
    var fileURL = url + '/' + fileName;
    var fileETag = item.ETag[0].replace(/\"/g, '');
    var fileSize = item.Size[0];

    // Download the image
    request.get({url:fileURL, encoding:null}, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('Parsing EXIF data for', fileName);

        // Parse the EXIF data
        try {
          new parseEXIF(body, function(error, exifData) {
            if (!error) {
              // Put the EXIF data into our imageData array
              imageData.push({
                name: fileName,
                url: fileURL,
                etag: fileETag,
                size: fileSize,
                data: exifData
              });

              // Finish
              callback();
            } else {
              // Failed to parse EXIF data
              console.log('Error parsing EXIF data for', fileName);
              console.log(error.message);

              // Finish
              callback();
            }
          });
        } catch(error) {
          // Failed to parse EXIF data
          console.log('Error parsing EXIF data for', fileName);
          console.log(error.message);

          // Finish
          callback();
        }
      } else {
        // Failed to download image
        if (!error) {
          // Generate our own error message based on the statusCode/statusMessage
          error = {};
          error.message = 'Status code ' + response.statusCode + ' (' + response.statusMessage + ')';
        }

        console.log('Error fetching image', fileName);
        console.log(error.message);

        // Finish
        callback();
      }
    });
  }, function(){
    // Finished getting EXIF data for all images
    console.log('Finished getting EXIF data.');
    console.log(imageData.length + ' images successfully proccessed.');
    console.log((images.length - imageData.length) + ' images could not be processed.');

    // Run the next function
    //storeImageData();
  });
}*/
