const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth'); 
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');


dotenv.config();

const app = express(); 
app.use(cors());
app.use(express.json());


//routes
app.use('/api/auth' , authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);


//connect to mongoDB
//console.log("MONGO_URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGODB_URI)
.then(() =>{
    console.log('Connected to MongoDB');
})

.catch((error) =>{
    console.log('Error Connecting to MongoDB:' , error );
});
  
const PORT = process.env.PORT || 5000; 
app.listen(PORT , () =>{
    console.log(`server runnning on address http://localhost:${PORT}`);
});