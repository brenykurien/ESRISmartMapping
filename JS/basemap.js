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
		var rendererService = getVisibleLayerRendererServices();
		const selectedRenderer = this.value;
		console.log(selectedRenderer);
		setSelectedRenderer(selectedRenderer,rendererService);
	});
	function getVisibleLayerRendererServices(){
		var visibleLayer = layerListWidget.layers.filter(l=>l.visibility);
		var rendererServices = [];
		visibleLayer.map(v=>{
			if(v && v.id){
				rendererServices.push(getRendererServiceFromLayerId(v.id));
			}
		});
		return rendererServices;
	}
	function getRendererServiceFromLayerId(id){
		switch (id){
			case "talukLayerId":
				return talukRendererService;
			case "districtLayerId":
				return districtRendererService;
		}
	}
	function setSelectedRenderer(selectedRenderer,rendererServices){
		if(rendererServices){
			if (selectedRenderer == "ColorRenderer") {
				rendererServices.map(s=>s.CreateColorRenderer("SHAPE_Area"));
			} else if (selectedRenderer == "ClassedSizeRenderer") {
				rendererServices.map(s=>s.CreateClassedSizeRenderer("quantile","SHAPE_Area"));
			} else if (selectedRenderer == "ClassedColorRenderer") {
				rendererServices.map(s=>s.CreateClassedColorRenderer("quantile","SHAPE_Area"));
			} else if(selectedRenderer == "SizeRenderer"){
				rendererServices.map(s=>s.CreateSizeRenderer("SHAPE_Area"));
			} else if(selectedRenderer == "TypeRenderer"){
				rendererServices.map(s=>s.CreateTypeRenderer("Type"));
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
		var rendererService = getVisibleLayerRendererServices();
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
