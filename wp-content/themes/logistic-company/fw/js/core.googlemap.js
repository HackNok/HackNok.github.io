function logistic_company_googlemap_init(dom_obj, coords) {
	"use strict";
	if (typeof LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'] == 'undefined') logistic_company_googlemap_init_styles();
	LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'].geocoder = '';
	try {
		var id = dom_obj.id;
		LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id] = {
			dom: dom_obj,
			markers: coords.markers,
			geocoder_request: false,
			opt: {
				zoom: coords.zoom,
				center: null,
				scrollwheel: false,
				scaleControl: false,
				disableDefaultUI: false,
				panControl: true,
				zoomControl: true, //zoom
				mapTypeControl: false,
				streetViewControl: false,
				overviewMapControl: false,
				styles: LOGISTIC_COMPANY_STORAGE['googlemap_styles'][coords.style ? coords.style : 'default'],
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}
		};
		
		logistic_company_googlemap_create(id);

	} catch (e) {
		
		//dcl(LOGISTIC_COMPANY_STORAGE['strings']['googlemap_not_avail']);

	};
}

function logistic_company_googlemap_create(id) {
	"use strict";

	// Create map
	LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].map = new google.maps.Map(LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].dom, LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].opt);

	// Add markers
	for (var i in LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers)
		LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].inited = false;
	logistic_company_googlemap_add_markers(id);
	
	// Add resize listener
	jQuery(window).resize(function() {
		if (LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].map)
			LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].map.setCenter(LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].opt.center);
	});
}

function logistic_company_googlemap_add_markers(id) {
	"use strict";
	for (var i in LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers) {
		
		if (LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].inited) continue;
		
		if (LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].latlng == '') {
			
			if (LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].geocoder_request!==false) continue;
			
			if (LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'].geocoder == '') LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'].geocoder = new google.maps.Geocoder();
			LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].geocoder_request = i;
			LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'].geocoder.geocode({address: LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].address}, function(results, status) {
				"use strict";
				if (status == google.maps.GeocoderStatus.OK) {
					var idx = LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].geocoder_request;
					if (results[0].geometry.location.lat && results[0].geometry.location.lng) {
						LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = '' + results[0].geometry.location.lat() + ',' + results[0].geometry.location.lng();
					} else {
						LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[idx].latlng = results[0].geometry.location.toString().replace(/\(\)/g, '');
					}
					LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].geocoder_request = false;
					setTimeout(function() { 
						logistic_company_googlemap_add_markers(id); 
						}, 200);
				} else
					dcl(LOGISTIC_COMPANY_STORAGE['strings']['geocode_error'] + ' ' + status);
			});
		
		} else {
			
			// Prepare marker object
			var latlngStr = LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].latlng.split(',');
			var markerInit = {
				map: LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].map,
				position: new google.maps.LatLng(latlngStr[0], latlngStr[1]),
				clickable: LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].description!=''
			};
			if (LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].point) markerInit.icon = LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].point;
			if (LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].title) markerInit.title = LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].title;
			LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].marker = new google.maps.Marker(markerInit);
			
			// Set Map center
			if (LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].opt.center == null) {
				LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].opt.center = markerInit.position;
				LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].map.setCenter(LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].opt.center);				
			}
			
			// Add description window
			if (LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].description!='') {
				LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].infowindow = new google.maps.InfoWindow({
					content: LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].description
				});
				google.maps.event.addListener(LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].marker, "click", function(e) {
					var latlng = e.latLng.toString().replace("(", '').replace(")", "").replace(" ", "");
					for (var i in LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers) {
						if (latlng == LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].latlng) {
							LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].infowindow.open(
								LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].map,
								LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].marker
							);
							break;
						}
					}
				});
			}
			
			LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'][id].markers[i].inited = true;
		}
	}
}

function logistic_company_googlemap_refresh() {
	"use strict";
	for (id in LOGISTIC_COMPANY_STORAGE['googlemap_init_obj']) {
		logistic_company_googlemap_create(id);
	}
}

function logistic_company_googlemap_init_styles() {
	// Init Google map
	LOGISTIC_COMPANY_STORAGE['googlemap_init_obj'] = {};
	LOGISTIC_COMPANY_STORAGE['googlemap_styles'] = {
		'default': []
	};
	if (window.logistic_company_theme_googlemap_styles!==undefined)
		LOGISTIC_COMPANY_STORAGE['googlemap_styles'] = logistic_company_theme_googlemap_styles(LOGISTIC_COMPANY_STORAGE['googlemap_styles']);
}