const db = require("../db");
const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');

// Works
router.get("/", async (req, res, next)=> {
    try {
        const results = await db.query(
            `SELECT id, comp_code, amt, paid, add_date, paid_date
            FROM invoices`);
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
router.get("/:id", async (req,res, next)=> {
    try {
        const results = await db.query(
            `SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.description 
            FROM invoices AS i
            FULL JOIN companies as c
            ON i.comp_code = c.code
            WHERE i.id = $1`, [req.params.id]);
        if(results.rows.length === 0) {
            throw new ExpressError(`Message with id of ${req.params.id} not found`, 404);
        }
        const { id, comp_code, description } = results.rows[0];
        return res.send({id, comp_code, description})
    } catch(e) {
        return next(e)
    }
});


// Works
router.post("/", async (req, res, next)=>{
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(`
        INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [comp_code, amt]);
    return res.status(201).json(results.rows[0]);
    }
    catch(e) {
        return next(e)
    }
})

// ??? Not Working!
router.put("/:id", async (req, res, next) => {
    try {
        const { comp_code, amt, paid, add_date, paid_date } = req.body; 
        const results = await db.query(`
        UPDATE invoices SET comp_code=$1 amt=$2 paid=$3 add_date=$4 paid_date=$5
        WHERE id=$6
        RETURNING id, comp_code, amt, paid, add_date, paid_date 
        `, [comp_code, amt, paid, add_date, paid_date, req.params.id])
        if(results.rows.length === 0) {
            throw new ExpressError("Message not found", 404); 
        }
    return res.json(results.rows[0])
    }
    catch(e){
        return next(e)
    }
})

// Works
router.delete("/:id", async (req, res, next)=>{
    try {
        const results = await db.query(`
        DELETE FROM invoices WHERE id = $1
        `, [req.params.id]);
    
    return res.json({message: 'Deleted'});

    } catch(e){
        return next(e)
    }
})





module.exports = router;