const { AppError } = require('./errorHandler');

/**
 * Validates incoming order payload before it reaches the controller.
 * Checks: customerName, phoneNumber, garments array integrity.
 */
const validateOrder = (req, _res, next) => {
  const { customerName, phoneNumber, garments } = req.body;

  if (!customerName || !customerName.trim()) {
    return next(new AppError('Customer name is required', 400));
  }

  if (!phoneNumber || !phoneNumber.trim()) {
    return next(new AppError('Phone number is required', 400));
  }

  // Basic phone format check (Indian 10-digit)
  const phoneClean = phoneNumber.replace(/[\s\-()]/g, '');
  if (!/^\+?\d{10,13}$/.test(phoneClean)) {
    return next(new AppError('Please enter a valid phone number', 400));
  }

  if (!garments || !Array.isArray(garments) || garments.length === 0) {
    return next(new AppError('At least one garment is required', 400));
  }

  for (let i = 0; i < garments.length; i++) {
    const g = garments[i];
    if (!g.type || !g.type.trim()) {
      return next(new AppError(`Garment #${i + 1}: type is required`, 400));
    }
    if (!g.quantity || g.quantity < 1) {
      return next(new AppError(`Garment #${i + 1}: quantity must be at least 1`, 400));
    }
    if (g.pricePerItem === undefined || g.pricePerItem < 0) {
      return next(new AppError(`Garment #${i + 1}: price must be a positive number`, 400));
    }
  }

  next();
};

module.exports = validateOrder;
