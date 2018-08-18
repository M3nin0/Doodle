const len = 784;
const total_data = 1000;

const CLOCK = 0;
const FACE = 1;
const FINGER = 2;

let nn;

let clocks = {};
let faces = {};
let fingers = {};

let classes = {0: 'Clock', 1: 'Face', 2: 'Finger'};

/**
 * Temp =D
 * @param {int} ms 
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function preLoad() {
    clocks.data = loadBytes('http://127.0.0.1:5000/data_filtered/clock_filtered.npy')
    faces.data = loadBytes('http://127.0.0.1:5000/data_filtered/face_filtered.npy');
    fingers.data = loadBytes('http://127.0.0.1:5000/data_filtered/finger_filtered.npy');
}

function drawData(data) {
    let total = 100;
    for (let n = 0; n < total; n++) {
        let img = createImage(28, 28);
        img.loadPixels();

        let offset = n * len;
        for (let i = 0; i < len; i++) {
            let val = data.bytes[i + offset];

            img.pixels[i * 4 + 0] = val; // R
            img.pixels[i * 4 + 1] = val; // G
            img.pixels[i * 4 + 3] = val; // B
            img.pixels[i * 4 + 4] = 255; // No transparency
        }

        img.updatePixels();
        let x = (n % 10) * 28;
        let y = floor(n / 10) * 28;
        image(img, x, y);
    }
}

function prepareData(category, data, label) {
    category.train = [];
    category.test = [];

    for (let i = 0; i < total_data; i++) {
        let offset = i * len;
        let threshold = floor(0.8 * total_data);
        
        // Data is train or test
        if (i < threshold) {
            category.train[i] = data.bytes.subarray(offset, offset + len);
            category.train[i].label = label;
        } else {
            category.test[i - threshold] = data.bytes.subarray(offset, offset + len);
            category.test[i - threshold].label = label;
        }
    }
}

function prepareToTrain() {
    prepareData(clocks, clocks.data, CLOCK);      
    prepareData(faces, faces.data, FACE);  
    prepareData(fingers, fingers.data, FINGER);  
}

/**
 * Function to train the Neural Network
 */
function trainEpochs() {
    // Train it to learn
    let training = [];
    training = training.concat(fingers.train);
    training = training.concat(faces.train);
    training = training.concat(clocks.train);
    shuffle(training, true); // Randomize function

    // Train for one epoch
    for (let i = 0; i < training.length; i++) {
        
        let data = training[i];
        let inputs = Array.from(data).map(x => x / 255);
    
        let label = training[i].label;
        let targets = [0, 0, 0];
        targets[label] = 1;

        nn.train(inputs, targets)
    }
    console.log('Trained for all epochs');
}

/**
 * Function to test the Neural Network results
 */
function testClassifier() {

    let correct = 0;

    // Testing the results
    let testing = [];
    testing = testing.concat(fingers.test);
    testing = testing.concat(faces.test);
    testing = testing.concat(clocks.test);

    for (let i = 0; i < testing.length; i++) {
        try {
            let data = testing[i];
            let inputs = Array.from(data).map(x => x / 255);
            let label = testing[i].label;
    
            let guess = nn.predict(inputs);
        
            if (guess.indexOf(max(guess)) === label) {
                correct++;
            }
        } catch (e) {
            // console.log('Index of error: ' + i);
        }
    }
    console.log('Hit Rate: ' + (100 * correct / testing.length));
}

async function setup() {
    createCanvas(280, 280);
    background(255);

    await preLoad();
    await sleep(2000);
    await prepareToTrain();
    // await drawData(clocks.data);

    // Inputs, Hidden, outputs
    nn = new NeuralNetwork(784, 64, 3);
}

/**
 * Function to get the user draw
 */
function predictDraw() {

    let inputs = [];
    let img = get();
    img.resize(28, 28);
    img.loadPixels();

    // For each RGBA pixel
    for (let i = 0; i < len; i ++) {
        let bright = img.pixels[i * 4];
        inputs[i] = (255 - bright) / 255.0; // Save the float point of each pixel in image
    }

    console.log(inputs);

    let guess = nn.predict(inputs);
    let classification = guess.indexOf(max(guess));

    console.log(classification)

    console.log(classes[classification]);
}

/**
 * Function to draw in canvas
 */
function draw() {
    strokeWeight(2);
    stroke(0);

    if(mouseIsPressed) {
        line(pmouseX, pmouseY, mouseX, mouseY);
    }
}
