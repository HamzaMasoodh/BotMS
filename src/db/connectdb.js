const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://taskeen_haider:z9m6KpuUH7s2VIIX@cluster0.ct66oxk.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
});
