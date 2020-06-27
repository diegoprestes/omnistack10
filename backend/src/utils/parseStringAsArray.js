module.exports = function parseStringAsArray(data) {
  return data.split(',').map(item => item.trim());
}