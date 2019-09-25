const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');


const redisUrl = 'redis://h:p9090de15f3f21c929a7cd3f069c6e9cfca226d84ea599bf97e95ad3b620f5822@ec2-52-1-169-125.compute-1.amazonaws.com:12679';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec; // stores a function to the original exec function



mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
};
mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  //console.log(this.getQuery());
  // console.log(this.mongooseCollection.name);
  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  })
  );

  // See if we have  value for 'key' in redis
  const cacheValue = await client.hget(this.hashKey, key);

  // If we do, return that
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc) ?
      doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  // Otherwise, issue the query and store the result in redis
  const result = await exec.apply(this, arguments);

  client.hset(this.hashKey, key, JSON.stringify(result));
  client.expire(this.hashKey, 10);

  return result;
};


module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};