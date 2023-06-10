const mysql = require("mysql2/promise");
const settings = require('./config.json');
//var pool = mysql.createPool(process.env.DB_POOL_CONFIG);
var pool = mysql.createPool(settings);
//console.log(process.env);
//console.log(settings);

async function getConnection(callback, res, errStatus, errorMessage) {

        try {
            var conn = await pool.getConnection();
            await callback(conn);
        }
        catch(err) {
            res.status(errStatus).json({
                message: errorMessage
            })
            console.log(err);
        }
        finally {
            conn.release();
        }


}

module.exports = getConnection;