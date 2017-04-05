// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var RowerSchema = new Schema({
  name: {
    type: String,
    required: false
  },
  hometown: {
    type: String,
    required: false
  },
  major: {
    type: String,
    required: false
  },
  link: {
    type: String,
    required: false
  },
  height: {
    type: String,
    required: false
  },
  class_year: {
    type: String,
    required: false
  },
  img: {
    type: String,
    required: false
  },
  // coomments is an array. 
   comments: {type: Array, 
    required: false
  }
});

// Create the Rower model with the RowerSchema
var Rower = mongoose.model("Rower", RowerSchema);

// Export the model
module.exports = Rower;