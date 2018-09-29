// var express = require('express');
// var router = express.Router();
var mongodb = require('mongodb');
var client = mongodb.MongoClient;
//need to add a user with access to my table
// var uri = "mongodb://root:example@192.168.1.134:27017/rolling-tasks";
var uri = "mongodb://192.168.1.134:27017/rolling-tasks";
var databaseConection = null;

function start() {
    getTaskCollection()
        .then((tasks) => {
            tasks.find({})
                .toArray()
                .then(function (docs) {
                    console.log(docs);
                });
        })

    getTaskQueueCollection()
        .then((taskQueues) => {
            taskQueues.find({})
                .toArray()
                .then(function (docs) {
                    console.log(docs);
                });
        })

    closeConnection();

}


function closeConnection() {
    databaseConection.close();
}

function getConnection() {
console.log('trying to get a connections')
    if(databaseConection != null) {
        console.log('in the if')
        return new Promise((resolve, reject) => {
            resolve(databaseConection);
        });
    } else {
        console.log('in the else')
        console.log(uri)
        return client.connect(uri).then((db, err) =>{
            console.log('got a connection');
            console.log(err);
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

  }
//user already subed to ask, just adding to queue
  function addTaskToQueue(user, task) {

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


// module.exports = router;
