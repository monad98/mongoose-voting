/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId;

/**
 * Expose mongoose voting
 */

module.exports = exports = voting;

/**
 * Mongoose Voting Plugin
 *
 * @param {Schema} schema MongooseSchema
 * @param {Object} options for plugin configuration
 * @api public
 */

function voting (schema, options) {
    options || ( options = {} );

    var voterModelName = options.ref || 'User';

    schema.add({
        vote: {
            positive: [{ type: ObjectId, ref: voterModelName }],
            negative: [{ type: ObjectId, ref: voterModelName }]
        }     ,
        voteCount: {
            likes:{type:Number, default:0, index:true},
            dislikes:{type:Number, default:0}
        }
    });

    schema.methods.upvote = function upvote(user, fn) {
        // Reset vote if existed
        //console.log("vote.positive:"+ this.vote.positive);
        this.vote.negative.pull(user);
        //console.log("vote.positive:"+ this.vote.positive);
        this.voteCount.dislikes = this.vote.negative.length;

        // Upvote
        var x = this.vote.positive.length;
        console.log("positive:"+x);

        this.vote.positive.addToSet(user);
        console.log("positive:"+x);
        this.voteCount.likes = this.vote.positive.length;


        // If callback fn, save and return
        if (2 === arguments.length) {
            this.save(fn);
        }
    };

    schema.methods.downvote = function downvote(user, fn) {
        // Reset vote if existed
        //console.log("vote.positive:"+ this.vote.positive);
        this.vote.positive.pull(user);
        //console.log("vote.positive:"+ this.vote.positive);

        this.voteCount.likes = this.vote.positive.length;


        // Downvote
        this.vote.negative.addToSet(user);
        this.voteCount.dislikes = this.vote.negative.length;


        // If callback fn, save and return
        if (2 === arguments.length) {
            this.save(fn);
        }
    };

    schema.methods.unvote = function unvote(user, fn) {
        this.vote.negative.pull(user);
        this.vote.positive.pull(user);
        this.voteCount.dislikes = this.vote.negative.length;
        this.voteCount.likes = this.vote.positive.length;


        // If callback fn, save and return
        if (2 === arguments.length) {
            this.save(fn);
        }
    }

    schema.methods.upvoted = function upvoted(user) {
        if (user._id) {
            return schema.methods.upvoted.call(this, user._id);
        }

        return !!~this.vote.positive.indexOf(user);
    };

    schema.methods.downvoted = function downvoted(user) {
        if (user._id) {
            return schema.methods.downvoted.call(this, user._id);
        }

        return !!~this.vote.negative.indexOf(user);
    };

    schema.methods.voted = function voted(user) {
        if (user._id) {
            return schema.methods.voted.call(this, user._id);
        }

        return schema.methods.upvoted(user) || schema.methods.downvoted(user);
    };

    schema.methods.upvotes = function upvotes() {
        return this.vote.positive.length;
    };

    schema.methods.downvotes = function upvotes() {
        return this.vote.negative.length;
    };

    schema.methods.votes = function upvotes() {
        var positives = this.vote.positive;
        var negatives = this.vote.negative;
        return [].concat(positives).concat(negatives).length;
    }

}
