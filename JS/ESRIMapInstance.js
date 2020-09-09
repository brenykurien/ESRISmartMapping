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
				_this.map = new Map(_this.mapId, {basemap: _this.basemap, extent: initExtent});
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

ESRIMapInstance.FeatureLayer = function(_featureCollection,_selectedProperty){
	this.featureCollection = _featureCollection;
	this.selectedProperty = _selectedProperty;
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
								outFields: ["*"]//,								
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

ESRIMapInstance.SmartMappingRenderer = function(layer, map){
	this.layer = layer;
	this.map = map;
}

ESRIMapInstance.SmartMappingRenderer.prototype = 
{
	CreateClassedColorRenderer : function(classificationMethod, field){
		var _this = this;
		return new Promise(resolve => {
			require([
	        "esri/renderers/smartMapping"
			], function(smartMapping) {
				resolve(smartMapping.createClassedColorRenderer({
					layer: _this.layer,
					field: field,
					basemap: _this.map.getBasemap(),
					classificationMethod: classificationMethod
				}));
			});
		});
	},
	CreateClassedSizeRenderer : function(classificationMethod, field){
		var _this = this;
		return new Promise(resolve => {
			require([
	        "esri/renderers/smartMapping"
			], function(smartMapping) {
				resolve(smartMapping.createClassedSizeRenderer({
					layer: _this.layer,
					field: field,
					basemap: _this.map.getBasemap(),
					classificationMethod: classificationMethod
				}));
			});
		});
	},
	CreateColorRenderer : function(classificationMethod, field){
		var _this = this;
		return new Promise(resolve => {
			require([
	        "esri/renderers/smartMapping"
			], function(smartMapping) {
				resolve(smartMapping.createColorRenderer({
					layer: _this.layer,
					field: field,
					basemap: _this.map.getBasemap(),
					classificationMethod: classificationMethod
				}));
			});
		});
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