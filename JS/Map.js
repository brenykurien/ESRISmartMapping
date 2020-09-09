async function CreateMapInstance(){

	var mapService = new ESRIMapInstance.Map("mapId", "topo");
	var map = await mapService.CreateMap();

	var adminBoundaryService = new FeatureSetJSONService.AdminBoundary();
	var talukFeatureSet = adminBoundaryService.GetTaluks();

	var talukFeatureSetService = new ESRIMapInstance.FeatureSet(talukFeatureSet);
	//talukFeatureSetService.AddFieldToFeatuerSet("Value", 10, "esriFieldTypeString");
	//talukFeatureSetService.AssignRandomValuesToValue();
	var talukFeatureCollection = talukFeatureSetService.CreateFeatureCollectionFromFeatureSet();

	var talukFeatureLayerService = new ESRIMapInstance.FeatureLayer(talukFeatureCollection,"Value");
	var talukLayer = await talukFeatureLayerService.CreateFeatureLayerFromFeatureCollection("KGISTalukName");
	//await talukFeatureLayerService.CreateFeatureLayerFromFeatureCollection();
	//talukFeatureLayerService.CreateInfoTemplate("KGISTalukName");

	var rendererService = new ESRIMapInstance.SmartMappingRenderer(talukLayer, map);
	rendererService.CreateColorRenderer("quantile","SHAPE_Area")
	.then(response=>{
		talukLayer.setRenderer(response.renderer);
		map.addLayer(talukLayer);
	})
	.catch(error => {
		console.log(error);
	});
	
	var legend = await new ESRIMapInstance.Legend(map,talukLayer,"","legendDiv");

	legend.startup();

	map.on("layer-add", function () {
		legend.refresh();
	});

	var renderersNodes = document.querySelectorAll(`.renderer-item`);
	var renderersElement = document.getElementById("renderers-filter");

	// click event handler for seasons choices
	renderersElement.addEventListener("click", filterByRenderer);
	// User clicked on Winter, Spring, Summer or Fall
	// set an attribute filter on flood warnings layer view
	// to display the warnings issued in that season
	function filterByRenderer(event) {
		const selectedRenderer = event.target.getAttribute("data-renderer");
		console.log(selectedRenderer);
		//map.removeLayer(layer);
		if (selectedRenderer == "ColorRenderer") {
			rendererService.CreateColorRenderer("quantile","SHAPE_Area")
			.then(response=>{
				talukLayer.setRenderer(response.renderer);
				talukLayer.redraw();
			})
			.catch(error => {
				console.log(error);
			});
		} else if (selectedRenderer == "ClassedSizeRenderer") {
			rendererService.CreateClassedSizeRenderer("quantile","SHAPE_Area")
			.then(response=>{
				talukLayer.setRenderer(response.renderer);
				talukLayer.redraw();
			})
			.catch(error => {
				console.log(error);
			});
		} else if (selectedRenderer == "ClassedColorRenderer") {
			rendererService.CreateClassedColorRenderer("quantile","SHAPE_Area")
			.then(response=>{
				talukLayer.setRenderer(response.renderer);
				talukLayer.redraw();
			})
			.catch(error => {
				console.log(error);
			});
		}
	}	
}

CreateMapInstance();