const { User, Student, Teacher } = require("../model/User");
const pool = require("./db");

exports.findByLogin = async (login) => {
    const query = 'SELECT * FROM "User" WHERE "login" = $1';
    const values = [login];
    const result = await pool.query(query, values);
    return result.rows.length ? User.fromJson(result.rows[0]) : null;
};

exports.findById = async (id) => {
    const query = 'SELECT * FROM "User" WHERE "id" = $1';
    const values = [id];
    const result = await pool.query(query, values);
    return result.rows.length ? User.fromJson(result.rows[0]) : null;
};

exports.insert = async (userCreateDTO) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const query = `
            INSERT INTO "User" ("name", "login", "password", "role")
            VALUES ($1, $2, $3, $4)
            RETURNING *`;
        const values = [userCreateDTO.name, userCreateDTO.login, userCreateDTO.password, userCreateDTO.role];
        const result = await client.query(query, values);
        await client.query("COMMIT");
        return User.fromJson(result.rows[0]);
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

exports.findAllStudents = async () => {
    const query = 'SELECT * FROM "User" WHERE "role" = \'student\'';
    const result = await pool.query(query);
    return result.rows.map(row => Student.fromJson(row));
};

exports.findAllTeachers = async () => {
    const query = 'SELECT * FROM "User" WHERE "role" = \'teacher\'';
    const result = await pool.query(query);
    return result.rows.map(row => Teacher.fromJson(row));
};

exports.findStudentById = async (studentId) => {
    const query = 'SELECT * FROM "User" WHERE "id" = $1 AND "role" = \'student\'';
    const values = [studentId];
    const result = await pool.query(query, values);
    return result.rows.length ? Student.fromJson(result.rows[0]) : null;
};