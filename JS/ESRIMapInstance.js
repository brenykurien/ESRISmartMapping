var ESRIMapInstance = {};

ESRIMapInstance.Map = function (_mapId, _baseMap) {
	this.mapId = _mapId;
	this.basemap = _baseMap;	
}

ESRIMapInstance.Map.prototype = 
{
	CreateMap: function(){
		var _this = this;
		return new Promise(resolve => {
			require([
			"esri/map",
			"esri/SpatialReference",
			"esri/geometry/Extent"
			],  function(Map, SpatialReference, Extent){
				var initExtent = Extent(7823224.14, 1131466.21, 9237003.42, 2208922.56, new SpatialReference({
		            "wkid": 102100
		        }));
		        if(typeof _this.basemap == 'undefined'){
		        	_this.map = new Map(_this.mapId, {extent: initExtent});
		        } else {	        	
					_this.map = new Map(_this.mapId, {basemap: _this.basemap, extent: initExtent});
		        }
				resolve(_this.map);
			});
		  });
	}
}

ESRIMapInstance.FeatureSet = function (_featureSet){
	this.featureSet = _featureSet;
}

ESRIMapInstance.FeatureSet.prototype = 
{	
	AddFieldAlias: function (fieldAlias) {
		this.featureSet.fieldAliases[fieldAlias] = fieldAlias;
	},
	AddFields: function (alias, length, name, type) {
		var newObj = {};
		newObj.alias = alias;
		newObj.length = length;
		newObj.name = name;
		newObj.type = type;
		this.featureSet.fields.push(newObj);
		this.fieldAdded = name;
	},	
	// Specific for my use function
	AddFieldToFeatuerSet: function (field, length, type) {
		this.fieldAdded = field;
		this.AddFieldAlias(field);
		this.AddFields(field, length, field, type);
	},
	AssignRandomValuesToValue: function(){
		this.featureSet.features.map(f => {
			f.attributes[this.fieldAdded] = Math.floor(Math.random() * 100);
		});
	},
	AssignRandomTypesToValues : function(){
		var arr = ["Like a lot","Like","Okay","Dont like","Dont like at all"];
		this.featureSet.features.map(f => {
			f.attributes[this.fieldAdded] = arr[Math.floor(Math.random() * arr.length)]; 
		});
	},
	CreateFeatureCollectionFromFeatureSet: function() {
		var layerDefinition = {
			"geometryType": this.featureSet.geometryType,
			"fields": this.featureSet.fields
		}
		var featureCollection = {
			layerDefinition: layerDefinition,
			featureSet: this.featureSet
		};
		return featureCollection;
	}
}

ESRIMapInstance.FeatureLayer = function(_featureCollection,_id){
	this.featureCollection = _featureCollection;
	this.id = _id;
}

ESRIMapInstance.FeatureLayer.prototype = 
{
	CreateFeatureLayerFromFeatureCollection : function(popUpTitleField){
		var _this = this;
		return new Promise(resolve => {
		    require([
	        "esri/layers/FeatureLayer",	        
			"esri/dijit/PopupTemplate",
	        ], function(FeatureLayer, PopupTemplate){
	        	var layer = new FeatureLayer(_this.featureCollection, {
								mode: FeatureLayer.MODE_ONDEMAND,
								visible: true,
								outFields: ["*"],
								id: _this.id//,								
								// infoTemplate: new PopupTemplate({
								// 	title: "{KGISTalukName}",
								// 	fieldInfos: [
								// 		{
								// 			fieldName: _this.selectedProperty,
								// 			label: "Total Population",
								// 			visible: true,
								// 			format: { places: 0 }
								// 		}
								// 	]
								// })
		                    });
	        	_this.layer = layer;
	        	_this.CreateInfoTemplate(popUpTitleField);
	        	_this.SetInfoTemplateToLayer();
	        	resolve(layer);
			});
		  });
	},
	CreateInfoTemplate: function(property){
		var _this = this;
		require([
		  "esri/InfoTemplate"
		], function(InfoTemplate) {
		    _this.template = new InfoTemplate();
		    _this.SetInfoTemplateTitle(property);
		});
	},
	SetInfoTemplateTitle: function(property){
		this.template.setTitle("${"+property+"}");
	},
	SetInfoTemplateContent: function(_text){
		this.template.setContent(_text);
	},
	SetInfoTemplateToLayer: function(){
		this.layer.setInfoTemplate(this.template);
	}
}

ESRIMapInstance.SmartMappingRenderer = function(layer, id, map){
	this.map = map;
	this.layer = layer;
	this.id = id;
}

ESRIMapInstance.SmartMappingRenderer.prototype = 
{
	CreateClassedColorRenderer : function(classificationMethod, field){
		var _this = this;
		//return new Promise(resolve => {
			require([
	        "esri/renderers/smartMapping"
			], function(smartMapping) {
				//resolve(
					smartMapping.createClassedColorRenderer({
					layer: _this.layer,
					field: field,
					basemap: _this.map.getBasemap(),
					classificationMethod: classificationMethod
				})
				.then((response)=>_this.handleSucess(response))
				.catch((error)=>_this.handleError(error));
					//);
			});
		//});
	},
	CreateClassedSizeRenderer : function(classificationMethod, field){
		var _this = this;
		//return new Promise(resolve => {
			require([
	        "esri/renderers/smartMapping"
			], function(smartMapping) {
				//resolve(
				smartMapping.createClassedSizeRenderer({
					layer: _this.layer,
					field: field,
					basemap: _this.map.getBasemap(),
					classificationMethod: classificationMethod
				//}));
			})
			.then((response)=>_this.handleSucess(response))
			.catch((error)=>_this.handleError(error));
		});
		//});
	},
	CreateColorRenderer : function(field){
		var _this = this;
		//return new Promise(resolve => {
			require([
	        "esri/renderers/smartMapping"
			], function(smartMapping) {
				//resolve(
				smartMapping.createColorRenderer({
					layer: _this.layer,
					field: field,
					basemap: _this.map.getBasemap()
				//}));
			})
			.then((response) =>_this.handleSucess(response))
			.catch((error)=>_this.handleError(error));
		});
		//});
	},
	CreateSizeRenderer : function(field){
		var _this = this;
		//return new Promise(resolve => {
			require([
	        "esri/renderers/smartMapping"
			], function(smartMapping) {
				//resolve(
				smartMapping.createSizeRenderer({
					layer: _this.layer,
					field: field,
					basemap: _this.map.getBasemap()
				//}));
				})
			.then((response)=>_this.handleSucess(response))
			.catch((error)=>_this.handleError(error));
		});
	},
	CreateTypeRenderer : function(field){
		var _this = this;
		//return new Promise(resolve => {
			require([
	        "esri/renderers/smartMapping"
			], function(smartMapping) {
				//resolve(
				smartMapping.createTypeRenderer({
					layer: _this.layer,
					field: field,
					basemap: _this.map.getBasemap()
				//}));
			})
			.then((response)=>_this.handleSucess(response))
			.catch((error)=>_this.handleError(error));
		});
	},
	handleSucess: function (response){
		this.layer.setRenderer(response.renderer);
		this.checkIfLayerExisits() ? this.layer.redraw() : this.addLayerToMap();
	},
	handleError: function (error){
		console.log(error);
	},
	addLayerToMap: function(){
		this.map.addLayer(this.layer);
	},
	checkIfLayerExisits: function(){
		if(this.map.graphicsLayerIds && this.map.graphicsLayerIds.length > 0 ){
			return this.map.graphicsLayerIds.includes(this.id)
		}
		return false;
	}
}

ESRIMapInstance.Legend = function(map,layer,title,legendDiv){
	return new Promise(resolve => {
		require([
		"esri/dijit/Legend"
		],  function(Legend){
			var legend = new Legend({
				map: map,
				layerInfos: [
					{ layer: layer, title: title }
				]
			}, legendDiv);
			resolve(legend);
		});
	  });
}

ESRIMapInstance.LayerList = function(map, layers, layerDiv){
	return new Promise(resolve => {
		require([
    	"esri/dijit/LayerList"
		],  function(LayerList){
			var layerList = new LayerList({
				           			map: map,
				           			layers: layers
				        		},layerDiv);
			resolve(layerList);
		});
	  });
}

ESRIMapInstance.BasemapRenderer = function(){
	return new Promise(resolve => {
		require([
			  "esri/renderers/SimpleRenderer",
			  "esri/symbols/SimpleFillSymbol",
			  "esri/Color",
			  "esri/symbols/SimpleLineSymbol"
			], function(SimpleRenderer,SimpleFillSymbol,Color,SimpleLineSymbol) {
				symbol = new SimpleFillSymbol();
				symbol.setColor(new Color("#ece8e8"));
				line = new SimpleLineSymbol();
				line.setColor(new Color([214, 214, 214,0.5]));
				line.width = 1;
				symbol.setOutline(line);
				var renderer = new SimpleRenderer(symbol);
				resolve(renderer);
		});
	});
}