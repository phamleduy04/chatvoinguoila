const axios = require('axios');
const tf = require('@tensorflow/tfjs-node');
const nsfw = require('nsfwjs');
(async () => {
    global.model = await nsfw.load();
    console.log('Loaded model nsfw!');
})();

module.exports = {
  detectNSFW: async function(url) {
    const pic = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    const image = await tf.node.decodeImage(pic.data, 3);
    const predictions = await model.classify(image);
    // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
    tf.dispose(image);
    image.dispose();
    return module.exports.reduceArr(predictions);
  },
  reduceArr: function(arr) {
    arr = arr.sort((a, b) => {
      return b.probability - a.probability;
    });

    const final = { highest: { className : arr[0].className, probability: arr[0].probability } };
    arr.forEach(el => {
        final[el.className] = el.probability;
    });
    return final;
  },
};
