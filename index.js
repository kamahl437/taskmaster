var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var bodyParser = require('body-parser')
var client = mongodb.MongoClient;
var _ = require('lodash');
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
router.post('/user/:userId/task/:taskId', function(req, res, next) {
    let userId = req.params.userId;
    let taskId = req.params.taskId;
    getTaskQueueCollection()
    .then((taskQueues) => {
        let user = taskQueues.find({id:userId})
        console.log(user);
        if(!user.subscribed) {
            user.subscribed = [];
        }
        user.subscribed.push(taskId);
        taskQueues.save(user);
    });
});



function start() {
    getTaskCollection()
    .then((tasks) => {
        tasks.find({})
            .toArray()
            .then(function (docs) {
               
            });
    })

    getTaskQueueCollection()
        .then((taskQueues) => {
            taskQueues.find({})
                .toArray()
                .then(function (docs) {
                    let josh = _.find(docs, {name: 'josh'});
                    console.log(josh.tasks);
                });
        })


}



function closeConnection() {
    databaseConection.close();
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

start();
  //subbing the dude to the task
  function subscribeUserToTask(user, task) {

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
//   let task = {
//     name: 'water plants',
//     day: 'm',
//     frequency: 'oddWeek'
// }

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

// router.get('/team/all', function(req, res, next) {
//   client.connect(uri, function (err, db) {
//     if (err) return next(err);
//     var collection = db.collection('team');
//     collection.find({}).toArray(function(err, docs) {
//       if (err) return next(err);
//       return res.json(docs);
//     });
//   });
// });

// router.get('/team/:teamId', function(req, res, next) {
//   getTeam(req.params.teamId, next).then(function (results) {
//     console.log('in he promise')
//     res.json(results);
//   });
// });



// router.post('/team', function(req, res, next) {
//   console.log('im in the method!')
//   var response = saveTeam(req.body, next);
//   return res.json(response);
// });

// // this method works but does not send back a proper response for some strange reason.  It sends error every time
// function saveTeam(team, cb) {
//   console.log(team);
//   var response = 'error'
//   client.connect(uri, function (err, db) {
// 	    if (err) cb(err)
//     	var collection = db.collection('team');
//     	collection.insert(team, function(err, result) {
//         console.log(result);
//         if(err){cb(err)}
// 			response =  { result: "success" };
//     	});
//   db.close();
// 	});
//   return response;
// }

// // this method works but does not send back a proper response for some strange reason.  It sends blank every time
// function getTeam(teamIdArg, cb) {
//   return client.connect(uri).then( function (db) {
//     //if (err) return cb(err);  I believe if I want this to work just use a catch instead
//     var collection = db.collection('team');
//     return collection.find({teamId:parseInt(teamIdArg)}).toArray().then(function(docs) {
//       console.log(`the docs for ${teamIdArg}`);
//       console.log(docs);
//       //if (err) return cb(err); I believe if I want this to work just use a catch instead
//       db.close();
//       return docs;
//     });
//   });
//   // the reason this doesn't work is because it gets returned before the above
//   //call back resolves... derp derp'
// }


module.exports = router;
