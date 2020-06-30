const axios = require('axios');
const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

module.exports = {
  async index(req, res) {
    const devs = await Dev.find();

    res.json(devs);
  },

  async store(req, res) {
    const { github_username, techs, latitude, longitude } = req.body;

    let dev = await Dev.findOne({ github_username });
    if (!dev) {
      const response = await axios.get(`https://api.github.com/users/${github_username}`);
    
      const { name = login, avatar_url, bio } = response.data;
      const techsArray = parseStringAsArray(techs);
    
      const location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
      
      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location,
      });

      // Filter connections that are a maximum of 10km of distance
      // and that the technologies match with new dev
      const sendSocketMessageTo = findConnections({ latitude, longitude }, techsArray);
      sendMessage(sendSocketMessageTo, 'new-dev', dev);
    }
  
    res.json(dev);
  },

  async update(req, res) {
    const { id } = req.params;

    const { techs, latitude, longitude } = req.body;

    const techsArray = parseStringAsArray(techs);

    try {
      let dev = await Dev.findOne({ _id: id });

      if (dev) {
        const location = {
          type: 'Point',
          coordinates: [longitude, latitude],
        };

        dev.techs = techsArray;
        dev.location = location;

        await dev.save();

        return res.json(dev);
      }
    } catch (err) {}

    res.status(404).json({ error: 'User does not exist' });
  },

  async destroy(req, res) {
    const { id } = req.params;

    try {
      let dev = await Dev.findOne({ _id: id });

      if (dev) {
        await Dev.deleteOne({ _id: id });

        return res.json({ success: true });
      }
    } catch (err) {}

    return res.status(404).json({ error: 'User does not exist' });
  }
};