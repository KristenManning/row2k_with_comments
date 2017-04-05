// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var RaceSchema = new Schema({
  // race_name is a required string
  race_name: {
    type: String,
    required: true
  },
  // link is a required string
  link: {
    type: String,
    required: true
  },
  // coomments is an array. 
   comments: {type: Array, 
    required: false
  }
});

// Create the Race model with the RaceSchema
var Race = mongoose.model("Race", RaceSchema);

// Export the model
module.exports = Race;