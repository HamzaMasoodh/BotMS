import * as mongoose from 'mongoose'
export const conection = mongoose.connect("mongodb+srv://hamzaMasood:fbO9u158F7r6rWB0@cluster0.mooqwzf.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
});



