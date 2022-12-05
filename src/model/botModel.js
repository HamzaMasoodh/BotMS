const mongoose = require('mongoose');

// Creation of Bot Schema
const botSchema = new mongoose.Schema({
    BotName : {
        type: String,
        required: true,
    },
    BotStatus : {
      type: String,
      required: true,
    },
    uuid : {
      type: String,
      required: true,
      // default: "1fdxfxdfe545ghg",
    },
    Message : {
      type: String,
      required: true,
    }
}, {
  timestamps: true
})
 
botSchema.pre("save", async function (next) {
  const bot =  this;
  console.log('Just Before Saving!');
  next();
});

// Creation of Model 
const Bot = new mongoose.model('Bot',botSchema)
module.exports = Bot

















































