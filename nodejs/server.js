const express = require('express');
const app = express();
const port = 3400;

app.use(express.json());

let polygons = [];

app.get('/rdt/api/getbbox/:x1/:y1/:x2/:y2', (req, res) => {
    const { x1, y1, x2, y2 } = req.params;
    const bbox = [parseFloat(x1), parseFloat(y1), parseFloat(x2), parseFloat(y2)];
    const image = 'satellite.tif';

    // เรียกใช้ฟังก์ชันที่คุณต้องการที่นี่
    tmsToGeotiff({ output: image, bbox: bbox, zoom: 15, source: 'Satellite', overwrite: true });

    // ส่งการตอบกลับ
    const response = {
        bbox: bbox
    };
    res.json(response);
});

// ฟังก์ชันจำลองสำหรับ `tms_to_geotiff`
function tmsToGeotiff({ output, bbox, zoom, source, overwrite }) {
    console.log(`Processing ${output} with bbox ${bbox}, zoom ${zoom}, source ${source}, overwrite ${overwrite}`);
    // ใส่ตรรกะการประมวลผลจริงที่นี่
}

// ใช้ static middleware สำหรับการเสิร์ฟไฟล์ในโฟลเดอร์ 'www'
app.use('/rdt', express.static('www'));
app.use('/rdt/data', express.static('data'));

app.listen(port, () => {
    console.log(` http://localhost:${port}`);
});
