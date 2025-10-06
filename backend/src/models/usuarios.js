const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = {
    // Función para crear un nuevo usuario
    async crear(nombre, email, password, rol_id) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, ?)',
            [nombre, email, passwordHash, rol_id]
        );
        return result.insertId;
    },

    // Función para buscar un usuario por su email
    async buscarPorEmail(email) {
        const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        return usuarios[0];
    }
};

module.exports = Usuario;