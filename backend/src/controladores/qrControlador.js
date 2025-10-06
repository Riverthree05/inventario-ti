const QRCode = require('qrcode');

exports.generarQR = async (req, res) => {
    try {
        const { activoId } = req.params;
        const host = req.get('host').split(':')[0];
        const token = req.query.token; // Leemos el token que nos envió el frontend

        // Construimos la URL CON el token
        const url = `http://${host}:3000/activos/${activoId}?token=${token}`;

        const qrImageDataURL = await QRCode.toDataURL(url, { errorCorrectionLevel: 'H' });
        res.json({ qrDataUrl: qrImageDataURL });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al generar el código QR' });
    }
};