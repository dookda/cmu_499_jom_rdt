
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    minZoom: 16,
    maxZoom: 18 // กำหนดระดับการซูมสูงสุดสำหรับ Esri
});


var gsat = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    minZoom: 16,
    maxZoom: 18 // กำหนดระดับการซูมสูงสุดสำหรับ Google Satellite
});

var lst = L.tileLayer.wms('http://geoserver:8080/geoserver/lst/wms?', {
    layers: 'cmu:lst_area_winter',
    format: 'image/png',
    transparent: true,
    minZoom: 14,
    maxZoom: 18,
    attribution: "Weather data © 2012 IEM Nexrad"
})

var lst = L.tileLayer.wms('http://geoserver:8080/geoserver/lst/wms?', {
    layers: 'lst:lst_area_summer',
    format: 'image/png',
    transparent: true,
    minZoom: 14,
    maxZoom: 18,
    attribution: "Weather data © 2012 IEM Nexrad"
})

var baseMaps = {
    "Esri World Imagery": Esri_WorldImagery,
    "OpenStreetMap": gsat,
};

var map = L.map('map', {
    center: [18.788346, 98.985291], // ตั้งค่าพิกัดศูนย์กลางของแผนที่
    zoomControl: false,
    zoom: 18, // ตั้งค่าระดับซูมเริ่มต้น
    layers: [Esri_WorldImagery], // เพิ่ม Tile Layer เป็นภาพถ่ายจาก Esri
    // กำหนดระดับการซูมสูงสุดสำหรับแผนที่ทั้งหมด
});

L.control.scale().addTo(map);


// สร้าง feature group สำหรับจัดการเลเยอร์
var cm = L.featureGroup().addTo(map);

// กำหนดสไตล์สำหรับเลเยอร์ GeoJSON
var style = {
    color: '#000000',    // ขอบสีดำ
    fillColor: 'transparent', // สีพื้นโปร่งใส
    opacity: 0.5,       // ความโปร่งใสของสีพื้น
    weight: 5            // ความหนาของขอบ
};

// fetch('nodejs\www\Random_cnx.geojson') // เปลี่ยน path/to/your-file.geojson เป็นที่ตั้งของไฟล์ GeoJSON ของคุณ
//     .then(response => response.json())
//     .then(data => {
//         L.geoJSON(data).addTo(map);
//     })
//     .catch(error => console.error('Error loading GeoJSON:', error));


// เพิ่มข้อมูล GeoJSON ไปยัง feature group พร้อมสไตล์
L.geoJSON(polygon, { style: style }).addTo(cm);

// สร้างอ็อบเจ็กต์ overlayMaps สำหรับการควบคุมเลเยอร์
var overlayMaps = {
    "ขอบเขตเทศบาลนครเชียงใหม่": cm,
    "LST_SUMMER": lst,
    "LST_Winter": lst
};

// สร้างการควบคุมเลเยอร์และเพิ่มไปยังแผนที่ที่มุมล่างขวา
L.control.layers(baseMaps, overlayMaps, { position: 'bottomleft' }).addTo(map);



map.on('click', (event) => {
    const latlng = event.latlng;
    const lat = latlng.lat.toFixed(2);
    const lng = latlng.lng.toFixed(2);
    console.log(`Latitude: ${lat}, Longitude: ${lng}`);
    document.getElementById("mapClick").value = `${lat}, ${lng}`;
});



map.on('zoomend', (event) => {
    document.getElementById("mapZoom").value = map.getZoom()
})

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);


map.pm.addControls({
    position: 'topleft',
    drawCircleMarker: false,
    drawMarker: false,
    rotateMode: false,
    drawPolyline: false,
    drawPolygon: false,
    drawCircle: false,
    drawText: false,
    cutPolygon: false,
    editControls: false

});

map.pm.setGlobalOptions({
    allowSelfIntersection: false, // ไม่อนุญาตให้เส้นทับกันเอง
    snapDistance: 30, // ระยะการ snap
});



var polygonCount = 0;

var cnt = 0;
var dataArr = [];
map.on('pm:create', function (event) {
    var layer = event.layer;
    var geoJSON = layer.toGeoJSON();
    var coordinates = geoJSON.geometry.coordinates[0];

    // คำนวณความกว้างและความสูงของ Rectangle ที่วาด
    var bounds = layer.getBounds();
    var width = bounds.getEast() - bounds.getWest();
    var height = bounds.getNorth() - bounds.getSouth();

    // แปลงความกว้างและความสูงจากพิกัดลอจิสติกส์เป็นเมตร
    var meterPerDegree = 111320; // ค่าประมาณเมตรต่อองศา
    var widthMeters = width * meterPerDegree * Math.cos(bounds.getSouth() * Math.PI / 180);
    var heightMeters = height * meterPerDegree;

    // ตรวจสอบว่าขนาดเกินที่กำหนดหรือไม่
    if (widthMeters > 305.7 || heightMeters > 305.7) {
        alert('ขนาดพื้นที่ในการวาดใหญ่เกินไป');
        map.removeLayer(layer); // ลบสี่เหลี่ยมผืนผ้าที่วาดเกินขนาด
        return; // ไม่ดำเนินการต่อ
    }


    layer.fid = cnt;
    drawnItems.addLayer(layer);

    var polygon = turf.polygon([coordinates]);
    var area = turf.area(polygon);

    polygonCount++;
    var polygonName = "Polygon ลำดับที่: " + polygonCount;

    var tooltipContent = `${polygonName}<br>Area: ${area.toFixed(2)} sq meters`;
    layer.bindTooltip(tooltipContent).openTooltip();

    layer.on("click", (e) => {
        console.log(e.target.fid);
        console.log(dataArr);

        let dataSelect = dataArr.filter(item => item.fid == e.target.fid);
        console.log(dataSelect);

        document.getElementById('metalRoof').value = dataSelect[0].mr;
        document.getElementById('concreteRoof').value = dataSelect[0].cr;
        document.getElementById('cementRoof').value = dataSelect[0].ct;
        document.getElementById('otherRoof').value = dataSelect[0].ot;
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('totalroof').value = dataSelect[0].total;
    });

    layer.pm.disable();

    console.log(coordinates[1][0], coordinates[3][1], coordinates[3][0], coordinates[1][1]);

    document.getElementById('loading-screen').style.display = 'flex';

    const server = 'https://geoserver/pdt/roofdetect';

    axios.post(server, {
        bbox: [coordinates[1][0], coordinates[3][1], coordinates[3][0], coordinates[1][1]]
    })
        .then(function (response) {
            let data = JSON.parse(response.data);
            console.log(data);

            let mr = 0;
            let cr = 0;
            let ot = 0;
            let ct = 0;

            data.features.forEach(feature => {
                feature.properties.name = "roof";
            });
            L.geoJSON(data, {
                style: function (feature) {
                    let color = "red";

                    if (feature.properties.label == "Metal roof") {
                        color = "yellow";
                        mr++;
                    } else if (feature.properties.label == "Concrete roof") {
                        color = "green";
                        cr++;
                    } else if (feature.properties.label == "Cement Roof") {
                        color = "pink";
                        ct++;
                    } else if (feature.properties.label == "Other roof") {
                        color = "blue";
                        ot++;
                    }
                    return { color: color };
                }
            }).bindPopup(function (layer) {
                return layer.feature.properties.label;
            }).addTo(map);

            dataArr.push({
                fid: cnt,
                mr: mr,
                cr: cr,
                ct: ct,
                ot: ot,
                total: mr + cr + ct + ot
            });

            // Update the input fields with the counts
            document.getElementById('metalRoof').value = mr;
            document.getElementById('concreteRoof').value = cr;
            document.getElementById('cementRoof').value = ct;
            document.getElementById('otherRoof').value = ot;
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('totalroof').value = mr + cr + ct + ot;
            cnt++;
        })
        .catch(function (error) {
            console.log(error);
            document.getElementById('loading-screen').style.display = 'none';
        });

    coordinates.forEach(function (coord, index) {
        var corner = "";
        if (index === 1) {
            corner = "มุมบนขวา";
            console.log(corner + ": [" + coord[1] + ", " + coord[0] + "]");
        } else if (index === 3) {
            corner = "มุมล่างซ้าย";
            console.log(corner + ": [" + coord[1] + ", " + coord[0] + "]");
        }
    });
});




map.on("pm:drawend", (e) => {
    // Get the layer that was drawn
    const layer = e.shape;

    // Log the GeoJSON object
    console.log(layer);
});


document.getElementById('toggleInfoBox').addEventListener('click', function () {
    var infoContent = document.getElementById('infoContent');

    if (infoContent.style.maxHeight) {
        // ถ้ามี max-height แสดงอยู่ ให้ปิด
        infoContent.style.maxHeight = null;
    } else {
        // ถ้าไม่มี max-height แสดงอยู่ ให้เปิด
        infoContent.style.maxHeight = infoContent.scrollHeight + 'px'; // ความสูงที่ใช้จริง
    }
});

// ตั้งค่าเริ่มต้นให้เปิดแถบข้อมูล
document.addEventListener('DOMContentLoaded', function () {
    var infoContent = document.getElementById('infoContent');
    infoContent.style.maxHeight = infoContent.scrollHeight + 'px';
});


