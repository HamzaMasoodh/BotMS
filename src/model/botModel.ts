import * as mongoose from 'mongoose';


// Creation of Bot Schema
const botSchema = new  mongoose.Schema({
    botName : {
        type: String,
        required: true,
    },
    botStatus : {
      type: String,
      required: true,
    },
    uuid : {
      type: String,
      required: true,
      // default: "1fdxfxdfe545ghg",
    },
    message : {
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
const Bot = mongoose.model('Bot',botSchema)

export {Bot}