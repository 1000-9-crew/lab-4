const pg = require("pg");

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    ssl: {
        rejectUnauthorized: false,
        // ca: ``,
    },
};

// DATE YYYY-MM-DD insted of JS Date (Thu Apr 17 2025 00:00:00 GMT+0300 (Восточная Европа, летнее время))
pg.types.setTypeParser(1082, (val) => val);

const pool = new pg.Pool(config);

module.exports = pool;