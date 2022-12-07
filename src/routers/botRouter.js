const express = require('express');
const Bot = require('../model/botModel')
const router = new express.Router();

// Create and Add Data into MongooDB
router.post('/createBot', async (req, res) => {
    const bot = new Bot({...req.body})
    console.log("This is Bot body....", bot)
    try {
        await bot.save()
        console.log(new Date().toLocaleString() + ' ' + 'Loading To Create Bot...')
        res.status(201).send(bot);
        console.log(new Date().toLocaleString() + ' ' + 'Creating Bot...')
    } catch(e) {
        console.log("This is error",e)
        res.status(400).send(e.message)
    }
})

// Read Data by uuid From MongooDB
router.get('/getBot/:uuid', async (req, res) => {
    try {
        const uuid = req.params.uuid
        const readBot = await Bot.findOne({uuid : uuid})
        if (!readBot) {
            return res.status(404).send({ message: "The bot id is not correct" });
          }

        console.log(new Date().toLocaleString() + ' ' + 'Loading To Read Bot...')
        res.send(readBot) 
        console.log(new Date().toLocaleString() + ' ' + 'Reading Bot...')    
    } catch(e) {
        res.status(500).send(e);
    }
})

// Read Data From MongooDB
router.get('/readBot', async (req, res) => {
    try {
        const readBot = await Bot.find({})
        console.log(new Date().toLocaleString() + ' ' + 'Loading To Read Bot...')
        res.send(readBot) 
        console.log(new Date().toLocaleString() + ' ' + 'Reading Bot...')    
    } catch(e) {
        res.status(500).send(e);
    }
})

// Delete ALl Data
router.delete('/deleteAllBot', async (req, res) => {
    try {
        const deleteAllBot = await Bot.remove({})
        console.log(new Date().toLocaleString() + ' ' + 'Loading To Delete All Bots...')        
        res.send(deleteAllBot)
        console.log(new Date().toLocaleString() + ' ' + 'Deleting All Bot...')  
    } catch (e) {
        res.status(500).send(e) 
    }
})

// Update Data By Id
router.patch('/updateBot/:uuid', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['BotName', 'BotStatus','Message']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    const uuid = req.params.uuid
    try {
        const updateBot = await Bot.findOne({uuid})
        if (!updateBot) {
            res.status(404).send('ID NOT FOUND FOR UPDATE!')
            console.log(new Date().toLocaleString() + ' ' + 'ID NOT FOUND FOR UPDATE!');
        }
        updates.forEach((update) => {
            updateBot[update] = req.body[update]
        })
        await updateBot.save()
        console.log(new Date().toLocaleString() + ' ' + 'Loading To Update By Id...')
        res.send(updateBot)
        console.log(new Date().toLocaleString() + ' ' + 'Update Bot By Id...')
    } catch(e) {
        res.status(400).send()
    }
})

module.exports = router