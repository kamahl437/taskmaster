var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser')
var client = mongodb.MongoClient;
var _ = require('lodash');
var ObjectId = require('mongodb').ObjectID
//need to add a user with access to my table
// var uri = "mongodb://root:example@192.168.1.134:27017/rolling-tasks";
var uri = "mongodb://192.168.1.134:27017/rolling-tasks";
var databaseConection = null;
var app = express();

//Next Task: Add the view for tasks to an express route so I can make a view screen.
//After that make an insert screen, then an assign to user screen.  Then you need to make the daemon that will schedule your tasks.

app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
app.use('/', router);
app.listen(8080);
///Yay this works
router.get('/tasks', function(req, res, next) {
    getTaskCollection()
    .then((tasks) => {
        tasks.find({})
            .toArray()
            .then(function (docs) {
                res.json(docs);
            });
    })
});
router.post('/task', function(req, res, next) {
    getTaskCollection()
    .then((tasks) => {
        insertNewTask(tasks, req.body)
    })
    res.send("inserted" + req.body);
});
router.get('/users', function(req, res, next) {
    getTaskQueueCollection()
    .then((taskQueues) => {
        taskQueues.find({})
            .toArray()
            .then((docs) => {
                res.json(docs);
            });
    });
});

router.get('/user/:userId', function(req, res, next) {
    let userId = req.params.userId;
    getTaskQueueCollection()
    .then((taskQueues) => {
        taskQueues.find(ObjectId(userId))
            .toArray()
            .then((docs) => {
                res.json(docs[0]);
            });
    });
});


//subscribes a user to a task schedge
router.post('/user/:userId/task/:taskId', function(req, res, next) {
    let userId = req.params.userId;
    let taskId = req.params.taskId;
    getTaskQueueCollection()
    .then((taskQueues) => {
        taskQueues.find({"_id":ObjectId(userId)})
            .toArray()
            .then((docs) => {
                let user = docs[0];
                if(!user.subscribed) {
                    user.subscribed = [];
                }
                user.subscribed.push(taskId);
                taskQueues.save(user);
                res.send('saved')
            });
    });
});

router.get('/daemon', function(req, res, next) {
    daemon();
});

function daemon() {
    getTaskQueueCollection()//users
    .then((taskQueues) => {
        taskQueues.find({})//get all of the users
        .toArray()
        .then((users) => {
            _.each(users,(user) => {//iterate the users
                addSubscribedTasks(user).then((updatedUser) => {
                    taskQueues.save(updatedUser);
                });
            });
        });
    });
}
// check if I should add to the queue
function shouldAddTask(evenWeek, task) {
    //I should later determine if its the right day and stuff
    return true;
}

function addSubscribedTasks(user) {
    _.each(user.subscribed, (id) => {
        getTaskCollection()
            .find(ObjectId(id))
            .toArray()
            .then((tasks) => {
                let task = tasks[0];
                if(shouldAddTask(user.evenWeek, task)) {
                    let taskCopy = _.deepCopy(task);
                    taskCopy.entryDate = Date();
                    user.tasks.push(taskCopy);
                    return user;
                }
            })
    });
}


function getConnection() {
    if(databaseConection != null) {
        return new Promise((resolve, reject) => {
            resolve(databaseConection);
        });
    } else {
        return client.connect(uri).then(function(db) {
            databaseConection = db;
            return databaseConection;
        });
    }
}
function getTaskCollection() {
    return getConnection()
    .then((db) => {
        return db.collection('tasks');
    })
}
function getTaskQueueCollection() {
    return getConnection()
    .then((db) => {
        return db.collection('task-queue');
    })
}

function insertNewUserQueue(collection, user) {
    collection.insert(user, function (err, result) {
        console.log(err)
        console.log(result);
    });
    
}
function insertNewTask(collection, task) {
    collection.insert(task, function (err, result) {
        console.log(err)
        console.log(result);
    });

}

//obv, but wondering there has to be a better way than passing the user around to every method.
  function finishTask(user, task) {

  }
//adding a task with a schedule, not to a user yet
  function addScheduledTask(task) {
    getTaskCollection()
        .then((tasks) =>{
            tasks.insertOne(task);
        })
  }
//user already subed to ask, just adding to queue
  function addTaskToQueue(collection, user, task) {
    
  }

// let userQueue = {
//     name: 'josh',
//     evenWeek: 'y',
//     subscribedTasks: [
//         'water plants', 'empty cat box'
//     ],
//     tasks: [
//         {
//             name: 'test',
//             late: true,
//             entryDate: Date()
//         }
//     ],//will want to clear things so old.  but this will be fun to track my progress
//     finishedTasks: [
//         {
//             name: 'something I finished',
//             late: false,
//             entryDate: Date(),
//             finishedDate: Date()
//         }
//     ]
// }

module.exports = router;
