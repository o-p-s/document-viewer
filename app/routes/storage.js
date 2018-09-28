const express=require('express'),directoryController=require('./../controllers/directoryController'),
auth=require('./../middlewares/authorize');

let setRouter=(app)=>{
    app.route('/').get(directoryController.homepage_template)
    app.get('/oauth/callback',auth.saveToken)
    app.get('/drive',auth.isAuthorized,directoryController.listAllFiles)
    app.get('/drive/folder',auth.isAuthorized,directoryController.viewFolder)
    app.get('/drive/download',auth.isAuthorized,directoryController.downloadFile)
    app.post('/drive/upload',auth.isAuthorized,directoryController.uploadFile)
}
module.exports={
    setRouter:setRouter
}