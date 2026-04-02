const pool = require('../config/db');

const saveNarrative = async (req, res, next) => {
    try {
        const { category, academic_year, narrative_text } = req.body;
        const faculty_id = req.user.id;

        if (!category || !academic_year || !narrative_text) {
            return res.status(400).json({ message: 'Missing required narrative fields' });
        }

        const query = `
            INSERT INTO narratives (faculty_id, category, academic_year, narrative_text, updated_at)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            ON CONFLICT (faculty_id, academic_year, category) 
            DO UPDATE SET narrative_text = EXCLUDED.narrative_text, updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [faculty_id, category, academic_year, narrative_text]);
        res.status(200).json(rows[0]);
    } catch (error) {
        next(error);
    }
};

const getMyNarrative = async (req, res, next) => {
    try {
        const { category, academic_year } = req.query;
        const faculty_id = req.user.id;

        const query = `
            SELECT * FROM narratives 
            WHERE faculty_id = $1 AND category = $2 AND academic_year = $3;
        `;
        const { rows } = await pool.query(query, [faculty_id, category, academic_year]);

        // Return 200 even if not found, just return empty state
        if (rows.length === 0) {
            return res.status(200).json({ narrative_text: '' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        next(error);
    }
};

const getFacultyNarratives = async (req, res, next) => {
    try {
        const { id } = req.params; // Faculty ID
        const currentYear = new Date().getFullYear().toString(); // Could be passed as query param

        const query = `
            SELECT * FROM narratives 
            WHERE faculty_id = $1 AND academic_year = $2;
        `;
        const { rows } = await pool.query(query, [id, currentYear]);
        res.status(200).json(rows);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    saveNarrative,
    getMyNarrative,
    getFacultyNarratives
};
