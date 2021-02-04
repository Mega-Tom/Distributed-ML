const tf = require('@tensorflow/tfjs-node');

const test = tf.sequential({
    layers: [
        tf.layers.conv2d({inputShape: [8,8,3], kernelSize: 15, activation: 'relu', padding: 'same', filters: 20}),
        tf.layers.conv2d({kernelSize: 5, activation: 'relu', padding: 'same', filters: 20}),
        tf.layers.conv2d({kernelSize: 5, activation: 'relu', padding: 'same', filters: 20}),
        tf.layers.conv2d({kernelSize: 3, activation: 'relu', padding: 'same', filters: 1}),
        tf.layers.reshape({targetShape: [64]}),
        tf.layers.softmax()
    ]
});

  test.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

exports.net = test;