async function CreateMapInstance(){

	var mapService = new ESRIMapInstance.Map("mapId", "topo");
	var map = await mapService.CreateMap();

	var adminBoundaryService = new FeatureSetJSONService.AdminBoundary();
	var talukFeatureSet = adminBoundaryService.GetTaluks();
	var districtFeatureSet = adminBoundaryService.GetDistricts();

	var talukFeatureSetService = new ESRIMapInstance.FeatureSet(talukFeatureSet);
	talukFeatureSetService.AddFieldToFeatuerSet("Type", 10, "esriFieldTypeString");
	talukFeatureSetService.AssignRandomTypesToValues();
	var talukFeatureCollection = talukFeatureSetService.CreateFeatureCollectionFromFeatureSet();
	var talukFeatureLayerService = new ESRIMapInstance.FeatureLayer(talukFeatureCollection,"talukLayerId");
	var talukLayer = await talukFeatureLayerService.CreateFeatureLayerFromFeatureCollection("TalukName");
	
	var districtFeatureSetService = new ESRIMapInstance.FeatureSet(districtFeatureSet);
	districtFeatureSetService.AddFieldToFeatuerSet("Type", 10, "esriFieldTypeString");
	districtFeatureSetService.AssignRandomTypesToValues();
	var districtFeatureCollection = districtFeatureSetService.CreateFeatureCollectionFromFeatureSet();
	var districtFeatureLayerService = new ESRIMapInstance.FeatureLayer(districtFeatureCollection,"districtLayerId");
	var districtLayer = await districtFeatureLayerService.CreateFeatureLayerFromFeatureCollection("DistrictName");

	var talukRendererService = new ESRIMapInstance.SmartMappingRenderer(talukLayer, "talukLayerId", map);
	talukRendererService.CreateColorRenderer("SHAPE_Area");

	var districtRendererService = new ESRIMapInstance.SmartMappingRenderer(districtLayer, "districtLayerId", map);
	districtRendererService.CreateColorRenderer("SHAPE_Area");

	// Selection drop down
	var dropdown = document.getElementById("fieldNames");
	dropdown.addEventListener('change', function(){
		var rendererService = getVisibleLayerRendererService();
		const selectedRenderer = this.value;
		console.log(selectedRenderer);
		setSelectedRenderer(selectedRenderer,rendererService);
	});
	function getVisibleLayerRendererService(){
		var visibleLayer = layerListWidget.layers.find(l=>l.visibility);
		var rendererService;
		if(visibleLayer && visibleLayer.id){
			if(visibleLayer.id == "talukLayerId"){
				rendererService = talukRendererService;
			} else if(visibleLayer.id == "districtLayerId"){
				rendererService = districtRendererService;
			}
		}
		return rendererService;
	}
	function setSelectedRenderer(selectedRenderer,rendererService){
		if(rendererService){
			if (selectedRenderer == "ColorRenderer") {
				rendererService.CreateColorRenderer("SHAPE_Area");
			} else if (selectedRenderer == "ClassedSizeRenderer") {
				rendererService.CreateClassedSizeRenderer("quantile","SHAPE_Area");
			} else if (selectedRenderer == "ClassedColorRenderer") {
				rendererService.CreateClassedColorRenderer("quantile","SHAPE_Area");
			} else if(selectedRenderer == "SizeRenderer"){
				rendererService.CreateSizeRenderer("SHAPE_Area");
			} else if(selectedRenderer == "TypeRenderer"){
				rendererService.CreateTypeRenderer("Type");
			}
		}
	}
	var layers = [
		{
			layer: talukLayer,
			title: "Taluks",
			visible: true,
			showLegend: true
		},
		{
			layer: districtLayer,
			title: "Districts",
			visible: true,
			showLegend: true
		}
	];
	var layerListWidget = await new ESRIMapInstance.LayerList(map,layers,"layerList");
	layerListWidget.on("toggle",function(){
		var rendererService = getVisibleLayerRendererService();
		const selectedRenderer = dropdown[dropdown.selectedIndex].value;
		console.log(selectedRenderer);
		setSelectedRenderer(selectedRenderer,rendererService);
	});
	layerListWidget.startup();
	map.on("layer-add", function () {
		layerListWidget.refresh();
	});
}

CreateMapInstance();