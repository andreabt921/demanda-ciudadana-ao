var map = null;

function filterDirections() {
    
    const directions = [...new Set(demandas.map(d => d.direccion_general))].sort();

    directions.forEach(n => {
        let o = new Option(n, n);
        /// jquerify the DOM object 'o' so we can use the html method
        $(o).html(n);
        $('#direccion-gral-select').append(o);
    });
    
}

function filterDemands(direction) {
    
    const demands = [...new Set(demandas.filter(b => b.direccion_general == direction).map(b => b.servicio))].sort();

    demands.forEach(s => {
        let o = new Option(s, s);
        $(o).html(s);
        $('#demanda-select').append(o);
    });
    
}

function initMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWJyYXZvOTIxIiwiYSI6ImNqcG10MjBzcDBzZTczeHA1Njltd2o4MGMifQ.Ey4FPNa9j5C4X8UODu_7gw';
			
	map = new mapboxgl.Map({
				container: 'map',
				style: 'mapbox://styles/abravo921/cjpmtrfa126e92sml6bp1z2br'
			});
    map.on('load', function () {
        map.addSource('ao-demands-src', {
            type: 'geojson',
            data: {
              "type": "FeatureCollection",
              "features": []
            }
        });


        map.addLayer({
            "id": "ao-demands",
            "type": "symbol",
            "source": 'ao-demands-src',
            "layout": {
                "icon-image": "blue_pin",
                "icon-allow-overlap": true,
                "icon-size": 0.07,
                "text-field": "",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            }
        });
        

        map.on('click', 'ao-demands', e => {
            const demand_id = e.features[0].properties.id;
            const info = demandas.find(b => b.id == demand_id);
            
            const t = `<tr><td>Tipo de demanda</td><td>${info['servicio']}</td></tr>`
                    + `<tr><td>Fecha</td><td>${info['fecha_apertura']}</td></tr>`
                    + `<tr><td>Dirección general</td><td>${info['direccion_general']}</td></tr>`
                    + `<tr><td>Dirección de área</td><td>${info['direccion_area']}</td></tr>`
                    + `<tr><td></td><td></td></tr>`;

            const calle = info.calle.length ? info.calle : '';
            const numero = info.numero.length ? info.numero : '';
            const colonia = info.colonia.length ? info.colonia : '';

            $('#info-table tbody').html(t);

            const img = info.imagen.length ? `<img src="./images/pictures/${info.imagen}.png"/>` : 'Sin imagen';
          
            $('#info-modal .modal-body #info-img').html(img);

            $('#info-modal .modal-footer p').text(`${calle} ${numero}, ${colonia}.`);

            $('#info-modal').modal('show');
        });
    });
   
}

function placeDemands(direction, demand) {
    let d = demandas.filter(b => b.direccion_general == direction && b.servicio == demand)
            .map(b => {
                const lng = b.lng ? Number(b.lng) : -99.1269;
                const lat = b.lat ? Number(b.lat) : 19.4978;
                return {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat]
                    },
                    "properties": {
                        "id": b.id
                    }
                }
            });
 
    map.getSource('ao-demands-src').setData({
        "type": "FeatureCollection",
        "features": d
    });
 
}

$(function(){ 
    initMap();
    filterDirections();
    $('#direccion-gral-select').on('change',function() {
        map.getSource('ao-demands-src').setData({
            "type": "FeatureCollection",
            "features": []
        });
        $('#demanda-select').empty().html('<option selected value="default">Selecciona una opción</option>');
        filterDemands(this.value);
    });

    $('#demanda-select').on('change',function() {
        const n = $('#direccion-gral-select').val();
        placeDemands(n,this.value);
    });

});