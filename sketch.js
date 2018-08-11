const len = 784;
const total_data = 1000;

const CLOCK = 0;
const FACE = 1;
const FINGER = 2;

let nn;

let clocks = {};
let faces = {};
let fingers = {};

/**
 * Temp =D
 * @param {int} ms 
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function preLoad() {
    clocks.data = loadBytes('data_filtered/clock_filtered.npy')
    faces.data = loadBytes('data_filtered/face_filtered.npy');
    fingers.data = loadBytes('data_filtered/finger_filtered.npy');
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
        
        if (i < threshold) {
            category.train[i] = data.bytes.subarray(offset, offset + len);
            category.train[i].label = label;
        } else {
            category.test[i - threshold] = data.bytes.subarray(offset, offset + len);
            category.test[i - threshold].label = label;
        }
    }
}

function train_and_test() {
    prepareData(clocks, clocks.data, CLOCK);      
    prepareData(faces, faces.data, FACE);  
    prepareData(fingers, fingers.data, FINGER);  
}

async function setup() {
    createCanvas(280, 280);
    background(0);

    await preLoad();
    await sleep(2000);
    await drawData(clocks.data);
    await train_and_test();

    // Inputs, Hidden, outputs
    nn = new NeuralNetwork(784, 64, 3);

    // Train it to learn
    let training = [];
    training = training.concat(fingers.train);
    training = training.concat(faces.train);
    training = training.concat(clocks.train);
    shuffle(training, true); // Randomize function

    // Train for one epoch
    for (let i = 0; i < 1; i++) {
        let inputs = training[i];
        let data = training[i];

        for (let j = 0; j < len; j++) {
            inputs[j] = data[j] / 255.0;
        }

        let label = training[i].label;
        let targets = [0, 0, 0];
        targets[label] = 1;

        nn.train(inputs, targets)
    }

    console.log('Trained for 1 epoch')

}
