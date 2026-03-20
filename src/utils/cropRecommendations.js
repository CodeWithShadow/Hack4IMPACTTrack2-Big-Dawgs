export const CROPS = [
    { name: 'Rice', icon: '🌾', category: 'Cereal', season: 'Kharif' },
    { name: 'Wheat', icon: '🌾', category: 'Cereal', season: 'Rabi' },
    { name: 'Corn', icon: '🌽', category: 'Cereal', season: 'Kharif' },
    { name: 'Cotton', icon: '🏵️', category: 'Cash Crop', season: 'Kharif' },
    { name: 'Sugarcane', icon: '🎋', category: 'Cash Crop', season: 'Annual' },
    { name: 'Soybean', icon: '🫘', category: 'Legume', season: 'Kharif' },
    { name: 'Potato', icon: '🥔', category: 'Vegetable', season: 'Rabi' },
    { name: 'Tomato', icon: '🍅', category: 'Vegetable', season: 'All Year' },
    { name: 'Onion', icon: '🧅', category: 'Vegetable', season: 'Rabi' },
    { name: 'Chili', icon: '🌶️', category: 'Spice', season: 'Kharif' },
    { name: 'Groundnut', icon: '🥜', category: 'Oilseed', season: 'Kharif' },
    { name: 'Mustard', icon: '🌿', category: 'Oilseed', season: 'Rabi' },
    { name: 'Apple', icon: '🍎', category: 'Fruit', season: 'Annual' },
    { name: 'Mango', icon: '🥭', category: 'Fruit', season: 'Summer' },
    { name: 'Banana', icon: '🍌', category: 'Fruit', season: 'Annual' },
    { name: 'Grapes', icon: '🍇', category: 'Fruit', season: 'Annual' },
    { name: 'Tea', icon: '🍵', category: 'Plantation', season: 'Annual' },
    { name: 'Coffee', icon: '☕', category: 'Plantation', season: 'Annual' },
    { name: 'Jute', icon: '🌿', category: 'Fiber', season: 'Kharif' },
    { name: 'Turmeric', icon: '🟡', category: 'Spice', season: 'Kharif' },
    { name: 'Pepper', icon: '🫑', category: 'Vegetable', season: 'All Year' },
    { name: 'Cucumber', icon: '🥒', category: 'Vegetable', season: 'Kharif' },
    { name: 'Strawberry', icon: '🍓', category: 'Fruit', season: 'Winter' },
    { name: 'Lentils', icon: '🫘', category: 'Legume', season: 'Rabi' },
    { name: 'Chickpea', icon: '🫘', category: 'Legume', season: 'Rabi' },
];

export const SOIL_CROP_MAP = {
    'Alluvial Soil': ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Corn', 'Potato', 'Banana'],
    'Black Cotton Soil': ['Cotton', 'Soybean', 'Wheat', 'Chickpea', 'Sugarcane', 'Onion'],
    'Red Soil': ['Groundnut', 'Potato', 'Tomato', 'Corn', 'Mango', 'Chili'],
    'Laterite Soil': ['Tea', 'Coffee', 'Cashew', 'Rubber', 'Coconut'],
    'Sandy Soil': ['Groundnut', 'Watermelon', 'Cucumber', 'Carrot', 'Potato'],
    'Clay Soil': ['Rice', 'Wheat', 'Cotton', 'Soybean', 'Lentils'],
    'Loamy Soil': ['Wheat', 'Sugarcane', 'Tomato', 'Pepper', 'Strawberry', 'Corn'],
    'Peaty Soil': ['Potato', 'Celery', 'Onion', 'Turmeric'],
    'Saline Soil': ['Barley', 'Cotton', 'Sugar Beet', 'Date Palm'],
    'Mountain Soil': ['Tea', 'Coffee', 'Apple', 'Strawberry', 'Grapes'],
};

export const IRRIGATION_FREQUENCIES = [
    'Daily', 'Twice Daily', 'Every 2 Days', 'Every 3 Days', 'Weekly', 'Bi-Weekly',
];
