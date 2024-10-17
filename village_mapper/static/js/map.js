document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([19.0, 73.0], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
     
    // initalizing villag layer 
    var villageLayer = L.geoJSON(villagesData, {
        style: function(feature) {
            return {
                fillColor: '#3388ff',
                weight: 2,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7
            };
        }
    }).addTo(map);

    var districtSelect = document.getElementById('district-select');
    var villageSelect = document.getElementById('village-select');
    var villageCheckboxes = document.getElementById('village-checkboxes');

    // Populate districts dynamically
    var districts = [...new Set(villagesData.features.map(f => f.properties.District))];
    districts.forEach(district => {
        var option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });

    districtSelect.addEventListener('change', function() {
        updateVillageSelect();
        updateMap();
    });

    villageSelect.addEventListener('change', updateMap);

    function updateVillageSelect() {
        var selectedDistrict = districtSelect.value;
        villageSelect.innerHTML = '<option value="">Select Village</option>';
        villageCheckboxes.innerHTML = '';

        var villages = villagesData.features
            .filter(f => f.properties.District === selectedDistrict)
            .map(f => f.properties.Village);

        villages.forEach(village => {
            var option = document.createElement('option');
            option.value = village;
            option.textContent = village;
            villageSelect.appendChild(option);

            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'village-' + village.replace(/\s+/g, '-').toLowerCase();
            checkbox.value = village;
            checkbox.addEventListener('change', updateMap);

            var label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.appendChild(document.createTextNode(village));

            var div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);

            villageCheckboxes.appendChild(div);
        });
    }

    function updateMap() {
        var selectedDistrict = districtSelect.value;
        var selectedVillage = villageSelect.value;
        var checkedVillages = Array.from(villageCheckboxes.querySelectorAll('input:checked')).map(cb => cb.value);

        villageLayer.clearLayers();

        var filteredFeatures = villagesData.features.filter(f => {
            if (selectedDistrict && f.properties.District !== selectedDistrict) return false;
            if (selectedVillage && f.properties.Village !== selectedVillage) return false;
            if (checkedVillages.length && !checkedVillages.includes(f.properties.Village)) return false;
            return true;
        });

        L.geoJSON(filteredFeatures, {
            style: function(feature) {
                return {
                    fillColor: '#3388ff',
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                };
            }
        }).addTo(villageLayer);

        if (filteredFeatures.length > 0) {
            map.fitBounds(villageLayer.getBounds());
        }
    }
});