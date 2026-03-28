require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('./models/User');
const indexRoutes = require('./routes/index');
const orderRoutes = require('./routes/order');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the 'public' folder


// Database connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));



  // Set views folder and view engine
app.set('views', path.join(__dirname, 'src', 'views')); // Updated for cross-platform compatibility
app.set('view engine', 'ejs');

// Use routes from external file
app.use('/', indexRoutes);


// Routes for rendering different views
app.get('/signup', (req, res) => res.render('signup', { errorMessage: null }));
app.get('/home', (req, res) => res.render('home'));
app.get('/forget', (req, res) => res.render('forgot_password', { errorMessage: null }));
app.get('/orders', (req, res) => {
  if (!req.session || !req.session.username) {
    return res.redirect('/login');
  }
  res.render('orders', { username: req.session.username });
});
app.get('/index', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => res.render('login', { errorMessage: null }));
app.get('/otp', (req, res) => res.render('otp',{ errorMessage: null }));
app.get('/newpassword', (req, res) => res.render('new_password',{ errorMessage: null }));

const MongoStore = require('connect-mongo');
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  httpOnly: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
  store: MongoStore.create({ mongoUrl: 'mongodb+srv://root:SAMEENASALEEMKHAN786@cluster0.npjqs.mongodb.net/sessions' }),
}));


app.use(orderRoutes);

const ordersApiRoutes = require('./routes/orders');
app.use('/api/orders', ordersApiRoutes); // ✅ This must exist

const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

//  signup form submission
app.post('/signup', async (req, res) => {
  const { UserName, Password, Mobile_No, Gmail, Confirm_Password } = req.body;

  const hasLetter = /[A-Za-z]/;
  const hasNumber = /[0-9]/;
  const isValidFormat = /^[A-Za-z\d ]{6,15}$/;
  const isGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  if (!UserName || !Password) {
    return res.render('signup', { errorMessage: 'Username & password are required' });
  }
  if (!isValidFormat.test(UserName)) {
    return res.render('signup', { errorMessage: 'Username 6-15 characters' });
  }
  if (!hasLetter.test(UserName)) {
    return res.render('signup', { errorMessage: 'Username at least one letter' });
  }
  if (!hasNumber.test(UserName)) {
    return res.render('signup', { errorMessage: 'Username at least one number' });
  }
  if (Password.length < 8 || Password.length > 20) {
    return res.render('signup', { errorMessage: 'Password 8-20 characters' });
  }
  if (Password !== Confirm_Password) {
    return res.render('signup', { errorMessage: 'Passwords do not match' });
  }
  if (!isGmail.test(Gmail)) {
    return res.render('signup', { errorMessage: 'not a valid gmail' });
  }
  try {
    const existingUser = await User.findOne({ UserName });
    if (existingUser) {
      return res.render('signup', { errorMessage: 'User Already Exist!' });
    }
    const existingUser1 = await User.findOne({ Gmail });
    if (existingUser1) {
      return res.render('signup', { errorMessage: 'Email already in use' });
}

    let mobileInput = req.body.Mobile_No;

    // Only for safety: convert to string if somehow array
    if (Array.isArray(mobileInput)) {
      mobileInput = mobileInput.find(m => m.startsWith('+')) || mobileInput[0];
    }

    const user = new User({
      UserName,
      Password,
      Mobile_No: mobileInput,
      Gmail
    });

    await user.save();

    return res.redirect('/login');
  }catch (error) {
    console.error(error);
    return res.render('signup', { errorMessage: 'Error To Signup User!' });
  }

});

// Login Page
app.post('/login', async (req, res) => {
  const { UserName, Password } = req.body;


  try {
    if (!UserName || !Password) {
      return res.render('login', { errorMessage: 'Invalid username or password!' });
    }

    const user = await User.findOne({ UserName });
    if (!user) {
      console.error('User not found');
      return res.render('login', { errorMessage: 'Invalid username' });
    }

    const isPasswordCorrect = await user.comparePassword(Password);
    if (!isPasswordCorrect) {
      console.error('Incorrect password');
      return res.render('login', { errorMessage: 'Incorrect password!' });
    }
    req.session.username = user.UserName;
    console.log("Username in session:", req.session.username);


    return res.redirect('/index'); // Ensure no further code runs
  } catch (error) {
    console.error('Detailed Server Error:', error);
    return res.render('login', { errorMessage: 'Server Error' });
  }
});
app.get('/logout', (req, res) => {
  if (!req.session) {
    return res.status(400).send('No active session to log out.');
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error logging out');
    }
    return res.redirect('/home');
  });
});

// Start server
app.listen(process.env.PORT, () => {
  console.log('Server running on http://localhost:',process.env.PORT);
});
   
