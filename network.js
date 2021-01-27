const tf = require('@tensorflow/tfjs-node');

const test = tf.sequential({
    layers: [
        tf.layers.conv2d({inputShape: [8,8,3], kernelSize: 5, activation: 'relu', padding: 'same', filters: 10}),
        tf.layers.conv2d({kernelSize: 5, activation: 'relu', padding: 'same', filters: 10}),
        tf.layers.conv2d({kernelSize: 5, activation: 'relu', padding: 'same', filters: 10}),
        tf.layers.conv2d({kernelSize: 3, activation: 'softmax', padding: 'same', filters: 1}),
    ]
});