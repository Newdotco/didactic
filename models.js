var mongoose = require('mongoose');
var	_ = require('underscore');
var Schema = mongoose.Schema;
var stream = require('getstream');

var connection = mongoose.connect('mongodb://localhost/newdotdb', function(error) {
	if(error) throw error;
	else
		console.log('Connected to mongodb');
});	

var FeedManager = stream.FeedManager;
var StreamMongoose = stream.mongoose;

var userSchema = new Schema(
	{
		username: {type: String, required: true},
		avatar_url: {type: String, required: true}
	},
	{
		collection: 'User' 
	}
);

var User = mongoose.model('User', userSchema);

var itemSchema = new Schema(
	{
		user: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
		image_url: {type: String, required: true},
		tong_count: {type: Number, default: 0}
	},
	{
		collection: 'Item'
	}
);

var Item = mongoose.model('Item', itemSchema);

var tongSchema = new Schema(
	{
		user: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
		item: {type: Schema.Types.ObjectId, required: true, ref: 'Item'}
	},
	{
		collection: 'Tong'
	}
);

var Tong = mongoose.model('Tong', tongSchema);

//tongSchema.plugin(StreamMongoose.activity);

tongSchema.statics.pathsToPopulate = function() {
	return ['user', 'item'];
};

tongSchema.methods.activityForeignId = function() {
	return this.user._id + ':' + this.item_id;
};

var followSchema = new Schema(
	{
		user: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
		target: {type: Schema.Types.ObjectId, required: true, ref: 'User'}
	},
	{
		collection: 'Follow'
	}
);

//followSchema.plugin(StreamMongoose.activity);

followSchema.methods.activityNotify = function() {
	target_feed = FeedManager.getNotificationFeed(this.target._id);
	return [target_feed];
};

followSchema.methods.activityForeignId = function() {
	return this.user._id + ':' + this.target._id;
};

followSchema.statics.pathsToPopulate = function() {
	return ['user', 'target'];
};

followSchema.post('save', function(doc) {
	if(doc.wasNew) {
		var userId = doc.user._id || doc.user;
		var targetId = doc.target._id || doc.target;
		FeedManager.followUser(userId, targetId);
	}
});

followSchema.post('remove', function(doc) {
	FeedManager.unfollowUser(doc.user, doc.target);
});

var Follow = mongoose.model('Follow', followSchema);

//StreamMongoose.setupMongoose(mongoose);

module.exports = {
	User: User,
	Item: Item,
	Tong: Tong,
	Follow: Follow
};