const pool = require("../database/index");
const postsController = {
    getAll: async (req, res) => {
        try {
            const [rows, fields] = await pool.query("SELECT * FROM posts");
            res.json({
                data: rows
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: "error"
            });
        }
    },
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows, fields] = await pool.query("SELECT * FROM posts WHERE id = ?", [id]);
            res.json({
                data: rows
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: "error"
            });
        }
    },
    create: async (req, res) => {
        try {
            const { title, content } = req.body;
            const sql = "INSERT INTO posts (title, content) VALUES (?, ?)";
            const [rows, fields] = await pool.query(sql, [title, content]);
            res.json({
                data: rows
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: "error"
            });
        }
    },
    update: async (req, res) => {
        try {
            const { title, content } = req.body;
            const { id } = req.params;
            const sql = "UPDATE posts SET title = ?, content = ? WHERE id = ?";
            const [rows, fields] = await pool.query(sql, [title, content, id]);
            res.json({
                data: rows
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: "error"
            });
        }
    },
    delete: async (req, res) => {
        try {
            const { id } = req.params
            const [rows, fields] = await pool.query("delete from posts where id = ?", [id])
            res.json({
                data: rows
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: "error"
            });
        }
    }
};

module.exports = postsController;
