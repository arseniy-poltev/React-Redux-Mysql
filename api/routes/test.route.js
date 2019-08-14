const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    try {
        console.log("Request from client>>>>>>>>>>");
        res.send("You can call backend apis now...\n Hostname is " + req.protocol + '://' + req.get('host'));
    } catch (err) {
        throw(err);
    }
});
module.exports = router;