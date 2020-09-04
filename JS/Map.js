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
}

CreateMapInstance();