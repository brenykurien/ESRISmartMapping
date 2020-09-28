async function CreateMapInstance(){

	var mapService = new ESRIMapInstance.Map("mapId");
	var map = await mapService.CreateMap();

	var adminBoundaryService = new FeatureSetJSONService.AdminBoundary();
	var talukFeatureSet = adminBoundaryService.GetTaluks();

	var talukFeatureSetService = new ESRIMapInstance.FeatureSet(talukFeatureSet);
	var talukFeatureCollection = talukFeatureSetService.CreateFeatureCollectionFromFeatureSet();
	var talukFeatureLayerService = new ESRIMapInstance.FeatureLayer(talukFeatureCollection,"baseLayerId");
	var talukLayer = await talukFeatureLayerService.CreateFeatureLayerFromFeatureCollection("TalukName");
    var basemapRenderer = await ESRIMapInstance.BasemapRenderer();
    talukLayer.setRenderer(basemapRenderer);
    map.addLayer(talukLayer);
    initSlider();
    function initSlider() {
        require(["esri/TimeExtent", "esri/dijit/TimeSlider",
        "dojo/_base/array","dojo/dom", "dojo/domReady!"],function(TimeExtent,TimeSlider,arrayUtils,dom){
            var months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
        var timeSlider = new TimeSlider({
            style: "width: 100%;"
        }, dom.byId("timeSliderDiv"));
        map.setTimeSlider(timeSlider);

        var timeExtent = new TimeExtent();
        var myTimeStepIntervals = [
            new Date(2020, 06, 01), 
            new Date(2020, 06, 10),
            new Date(2020, 06, 20), 
            new Date(2020, 06, 30), 
            new Date(2020, 07, 10),
            new Date(2020, 07, 20), 
            new Date(2020, 07, 31),
            new Date(2020, 08, 10),
            new Date(2020, 08, 20), 
            new Date(2020, 08, 30),
            new Date(2020, 09, 03)
        ];
        dom.byId("selectedDate").innerHTML = "<i>" + myTimeStepIntervals[0].getDate() + ' ' + months[myTimeStepIntervals[0].getMonth()-1] + "<\/i>";
        timeSlider.setTimeStops(myTimeStepIntervals);
        timeSlider.setThumbCount(1);
        timeSlider.singleThumbAsTimeInstant(true);
        //timeSlider.setThumbIndexes([0,0]);
        timeSlider.setThumbMovingRate(2000);
        timeSlider.startup();
        
        //add labels for every other time stop
        var labels = arrayUtils.map(timeSlider.timeStops, function(timeStop, i) {
            if ( i % 2 === 0 ) {
            return timeStop.getDate() + ' ' + months[timeStop.getMonth()-1];
            } else {
            return "";
            }
        });

        timeSlider.setLabels(labels);

        timeSlider.on("time-extent-change", function(evt) {
            var startValString = evt.startTime.getDate() + ' ' + months[evt.startTime.getMonth()-1];
            dom.byId("selectedDate").innerHTML = "<i>" + startValString  + "<\/i>";
        });
        })
        
    }
}

CreateMapInstance();
