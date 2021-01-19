const db = require("../db");
const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');

// Works
router.get("/", async (req, res, next)=> {
    try {
        const results = await db.query(
            `SELECT code, name, description
            FROM companies`);
        if (results.rows.length === 0) {
            throw new ExpressError(`Message with code ${req.params.code} not found`, 404)
        }
    return res.json(results.rows);
    }
    catch (e) {
        return next(e);
    }         
});

// Works
router.get('/:code', async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT c.code, c.name, c.description
            FROM companies AS c
            WHERE c.code = $1`, [req.params.code])
        if (results.rows.length === 0) {
            throw new ExpressError(`Message with code ${req.params.code} not found`, 404)
        }
        const { code, name, description } = results.rows[0];
        return res.send({ code, name, description })
    } catch (e) {
        return next(e)
    }
})

// Works
router.post("/", async (req, res, next) => {
    try {
        const {code, name, description} = req.body;
        const result = await db.query(`
            INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`, 
            [code, name, description]);
        if (result.rows.length === 0) {
                throw new ExpressError("Message not found", 404)
        }
        return res.status(201).json(result.rows[0]);
        }
        catch (e) {
            return next(e);
        }
});


// Works
router.patch("/:code", async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const result = await db.query(`
            UPDATE companies SET name=$1, description=$2
            WHERE code=$3
            RETURNING code, name, description`,
            [name, description, req.params.code]);
        if (result.rows.length === 0) {
            throw new ExpressError("Message not found", 404)
          }
        return res.json(result.rows[0]);
    }
    catch(e) {
        return next(e);
    }
})

// Works 
router.delete("/:code", async (req, res, next) => {
    try {
        const result = await db.query(`
            DELETE FROM companies WHERE code = $1
            `, [req.params.code]);
    
        return res.json({message: 'Deleted'});
    }
    catch (e) {
        return next(e);
    }
});

module.exports = router;