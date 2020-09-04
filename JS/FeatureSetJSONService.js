var FeatureSetJSONService = {};

FeatureSetJSONService.AdminBoundary = function () {
	this.districts = JSON.parse(JSON.stringify(districts));
	this.taluks = JSON.parse(JSON.stringify(taluks));
}

FeatureSetJSONService.AdminBoundary.prototype =
{
	GetDistricts: function () {
		return this.districts;
	},
	GetTaluks: function () {
		return this.taluks
	}

}