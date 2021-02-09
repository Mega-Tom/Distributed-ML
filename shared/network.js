const tf = require('@tensorflow/tfjs-node');

const test = tf.sequential({
    layers: [
        tf.layers.conv2d({inputShape: [8,8,3], kernelSize: 5, activation: 'relu', padding: 'same', filters: 20}),
        tf.layers.conv2d({kernelSize: 5, activation: 'relu', padding: 'same', filters: 20}),
        tf.layers.conv2d({kernelSize: 5, activation: 'relu', padding: 'same', filters: 20}),
        tf.layers.conv2d({kernelSize: 3, activation: 'relu', padding: 'same', filters: 1}),
        tf.layers.reshape({targetShape: [64]}),
        tf.layers.softmax()
    ]
});

test.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
});

async function update(file, weights){
    let model = await tf.loadLayersModel(`file://${file}/model.json`);
    console.log(`layer count: ${model.layers.length}; weight count: ${weights.length}`);
    model.layers.forEach((layer, i) => {
        layer.setWeights(weights[i].map((arr)=>tf.tensor(arr)));
    })
    await model.save(`file://${file}`);
};

exports.net = test;
exports.update = update;