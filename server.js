const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || '*';

// Middleware
app.use(express.json());
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fleet_credit_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ============================================================================
// SCHEMAS & MODELS
// ============================================================================

const CreditCardSchema = new mongoose.Schema({
  cardName: { type: String, required: true },
  bankName: { type: String, required: true },
  cardNumberLast4: { type: String, required: true, maxlength: 4 },
  creditLimit: { type: Number, required: true },
  statementDate: { type: Number, required: true, min: 1, max: 31 },
  dueDate: { type: Number, required: true, min: 1, max: 31 },
}, { timestamps: true });

const VehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true },
  rcExpiryDate: { type: String, required: true },
  insuranceExpiryDate: { type: String, required: true },
  fitnessExpiryDate: { type: String, required: true },
  pollutionExpiryDate: { type: String, required: true },
}, { timestamps: true });

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true }
}, { timestamps: true });

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true }
}, { timestamps: true });

const FuelLogSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  cardId: { type: String, default: '' },
  cardName: { type: String, default: 'Cash/Other' },
  amount: { type: Number, required: true },
  liters: { type: Number, required: true },
  kmDriven: { type: Number, default: 0 },
  mileage: { type: String, default: '-' },
  date: { type: String, required: true }
}, { timestamps: true });

const CardSettlementSchema = new mongoose.Schema({
  cardId: { type: String, required: true },
  monthYear: { type: String, required: true },
  paidAmount: { type: Number, default: 0 }
}, { timestamps: true });

const CreditCard = mongoose.model('CreditCard', CreditCardSchema);
const Vehicle = mongoose.model('Vehicle', VehicleSchema);
const Driver = mongoose.model('Driver', DriverSchema);
const Contact = mongoose.model('Contact', ContactSchema);
const FuelLog = mongoose.model('FuelLog', FuelLogSchema);
const CardSettlement = mongoose.model('CardSettlement', CardSettlementSchema);

// ============================================================================
// ROUTES
// ============================================================================

app.get('/', (req, res) => res.send('Fleet Engine API Active'));

// Cards API (No Delete Endpoint per requirements)
app.get('/api/credit-cards', async (req, res) => {
  try { res.json(await CreditCard.find().sort({ createdAt: -1 })); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/credit-cards', async (req, res) => {
  try { res.status(201).json(await new CreditCard(req.body).save()); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/credit-cards/:id', async (req, res) => {
  try { res.json(await CreditCard.findByIdAndUpdate(req.params.id, req.body, { new: true })); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

// Vehicles API
app.get('/api/vehicles', async (req, res) => {
  try { res.json(await Vehicle.find().sort({ createdAt: -1 })); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/vehicles', async (req, res) => {
  try { res.status(201).json(await new Vehicle(req.body).save()); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try { res.json(await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true })); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try { await Vehicle.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Drivers API
app.get('/api/drivers', async (req, res) => {
  try { res.json(await Driver.find().sort({ name: 1 })); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/drivers', async (req, res) => {
  try { res.status(201).json(await new Driver(req.body).save()); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try { await Driver.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Contacts API
app.get('/api/contacts', async (req, res) => {
  try { res.json(await Contact.find().sort({ name: 1 })); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contacts', async (req, res) => {
  try { res.status(201).json(await new Contact(req.body).save()); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/contacts/:id', async (req, res) => {
  try { await Contact.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

// Fuel Logs API
app.get('/api/fuel-logs', async (req, res) => {
  try { res.json(await FuelLog.find().sort({ date: -1 })); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/fuel-logs', async (req, res) => {
  try { res.status(201).json(await new FuelLog(req.body).save()); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/fuel-logs/:id', async (req, res) => {
  try { res.json(await FuelLog.findByIdAndUpdate(req.params.id, req.body, { new: true })); } 
  catch (err) { res.status(400).json({ error: err.message }); }
});

// Settlements API
app.get('/api/settlements', async (req, res) => {
  try { res.json(await CardSettlement.find()); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/settlements', async (req, res) => {
  try {
    const { cardId, monthYear, paidAmount } = req.body;
    let settlement = await CardSettlement.findOne({ cardId, monthYear });
    if (settlement) {
      settlement.paidAmount = paidAmount;
      await settlement.save();
    } else {
      settlement = await CardSettlement.create({ cardId, monthYear, paidAmount });
    }
    res.json(settlement);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));