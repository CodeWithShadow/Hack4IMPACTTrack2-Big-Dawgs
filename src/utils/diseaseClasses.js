export const DISEASE_CLASSES = [
    'Apple Scab',
    'Apple Black Rot',
    'Apple Cedar Rust',
    'Apple Healthy',
    'Blueberry Healthy',
    'Cherry Powdery Mildew',
    'Cherry Healthy',
    'Corn Gray Leaf Spot',
    'Corn Common Rust',
    'Corn Northern Leaf Blight',
    'Corn Healthy',
    'Grape Black Rot',
    'Grape Esca',
    'Grape Leaf Blight',
    'Grape Healthy',
    'Orange Haunglongbing',
    'Peach Bacterial Spot',
    'Peach Healthy',
    'Pepper Bacterial Spot',
    'Pepper Healthy',
    'Potato Early Blight',
    'Potato Late Blight',
    'Potato Healthy',
    'Raspberry Healthy',
    'Soybean Healthy',
    'Squash Powdery Mildew',
    'Strawberry Leaf Scorch',
    'Strawberry Healthy',
    'Tomato Bacterial Spot',
    'Tomato Early Blight',
    'Tomato Late Blight',
    'Tomato Leaf Mold',
    'Tomato Septoria Leaf Spot',
    'Tomato Spider Mites',
    'Tomato Target Spot',
    'Tomato Yellow Leaf Curl Virus',
    'Tomato Mosaic Virus',
    'Tomato Healthy',
];

export const CONTAGIOUS_DISEASES = [
    'Apple Scab', 'Apple Black Rot', 'Apple Cedar Rust',
    'Cherry Powdery Mildew',
    'Corn Gray Leaf Spot', 'Corn Common Rust', 'Corn Northern Leaf Blight',
    'Grape Black Rot', 'Grape Esca', 'Grape Leaf Blight',
    'Orange Haunglongbing',
    'Peach Bacterial Spot',
    'Pepper Bacterial Spot',
    'Potato Early Blight', 'Potato Late Blight',
    'Squash Powdery Mildew',
    'Strawberry Leaf Scorch',
    'Tomato Bacterial Spot', 'Tomato Early Blight', 'Tomato Late Blight',
    'Tomato Leaf Mold', 'Tomato Septoria Leaf Spot',
    'Tomato Yellow Leaf Curl Virus', 'Tomato Mosaic Virus',
];

export function getCropFromDisease(diseaseName) {
    const crop = diseaseName.split(' ')[0];
    return crop;
}

export function isContagious(diseaseName) {
    return CONTAGIOUS_DISEASES.includes(diseaseName);
}

export function isHealthy(diseaseName) {
    return diseaseName.toLowerCase().includes('healthy');
}
