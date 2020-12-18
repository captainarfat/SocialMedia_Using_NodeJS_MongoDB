const { populate } = require('../models/comment');
const Comment = require('../models/comment');
const Post = require('../models/post');
const commentsMailer = require('../mailers/comments_mailers');
const commentEmailWorker = require('../workers/comment_email_worker');
const queue = require('../config/kue');
const Like = require('../models/like');

module.exports.create = async function(req, res){
try{
    let post = await Post.findById(req.body.post);
   
   if (post){
    let comment = await Comment.create({
        content: req.body.content,
        post: req.body.post,
        user: req.user._id
    });
    
    post.comments.push(comment);
        post.save();

        comment = await comment.populate('user','name').execPopulate();
        //commentsMailer.newComment(comment);
        // let job = queueMicrotask.create('emails', comment).save(function(err){
        //     if(err){
        //         console.log('Error In Creating In Queue');
        //     }

        //     console.log(job.id);
        // });
        let job = queue.create('emails', comment).save(function(err){
            if(err){
                console.log('Error In Sending To The Queue', err);
                return;
            }
            console.log('Job Enquequed', job.id);
        })

        if(req.xhr){
            return res.status(200).json({
                data:{
                    comment: comment
                }, message: 'Post Creadted'
            });
        }
req.flash('Succes','Comment Published');
        res.redirect('/');
}
}
catch(err){
    console.log('Error', err)
    return;
}
}

module.exports.destroy = async function(req, res){
    try{
        let comment = await Comment.findById(req.params.id);

        if(comment.user == req.user.id){
            let postId = comment.post;
            comment.remove();

          let post = Post.findByIdAndUpdate(postId, { $pull: {comments: req.params.id}});

          await Like.deleteMany({likeable: comment._id, onModel: 'Comment'});
                if(req.xhr){
                    return res.status(200).json({
                        data:{
                            comment_id: req.params.id
                        },
                        message: "Post Deleted"
                    });
                }

                req.flash('success', 'Comment Deleted');

                return res.redirect('back');
            }
        else{
            req.flash('Error', 'Unauthorized');
            return res.redirect('back');
        }
    }
    catch(err){
        req.flash('error', err);
        return;
    }
   
}