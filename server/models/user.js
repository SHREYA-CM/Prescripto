const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Har user ka email unique hoga
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'], // Ab 3 roles: patient, doctor, admin
      default: 'patient', // Naya user by default patient hoga
    },
  },
  { timestamps: true } // Automatically 'createdAt' aur 'updatedAt' fields add karega
);

// Password hash karne ka code
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // Agar password modify nahi hua, toh skip karo
  }

  // Password hash karo
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password compare karne ka method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
