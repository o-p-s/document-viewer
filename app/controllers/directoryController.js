const express=require('express'),path=require('path'), {google} = require('googleapis'),fs=require('fs');
const mime = require('mime-types'),response =require('./../libs/responseLib');
/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */


let listAllFiles=(req,res)=>{
    const drive = google.drive({version: 'v3', auth:req.auth});
    drive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    }, (err, result) => {
      if (err){
      res.status(err.code).send(response.generate(true,err,err.code,null))
      }else if (result.data.files.length) {
        if (req.accepts('json')) 
        res.status(200).send(response.generate(false,'All Files Found.',200,result.data.files))
        else
        res.render('overview.ejs',{files:result.data.files,token:req.auth.credentials.access_token})
      }else 
        res.status(200).send(response.generate(false,'No Files Found.',200,null))
    });
}
let viewFolder=(req,res)=>{
    const drive = google.drive({version: 'v3', auth:req.auth});
    drive.files.list({
        pageSize: 10,
        q:"'0B_tZS9i1sNXTOEctNDMtcEVWODQ' in parents and trashed=false",
        fields:"nextPageToken, files(id, name)"
      }, function (err, result) {
        if (err) 
          res.status(err.code).send(response.generate(true,err,err.code,null))
        else if (result.data.files.length) {
            res.render('overview.ejs',{files:result.data.files,token:req.auth.credentials.access_token})
            //res.status(200).send(response.generate(false,'All Files Found.',200,result.data.files))
        }else 
            res.status(200).send(response.generate(false,'Files Found.',200,null))
    })
}

let downloadFile=(req,res)=>{
    const drive = google.drive({version: 'v3', auth:req.auth});
    var dest = fs.createWriteStream(`E:/tests/Cloud Elements/Backend/downloads/${req.query.name}`);
    drive.files.get({fileId: req.query.id,alt:'media'},{responseType: 'stream'},(err,result)=>{
        if(err){
        res.status(err.code).send(response.generate(true,err,err.code,null))
        }else result.data.on('end', ()=> {
            res.status(200).send(response.generate(false,'File has been Downloaded',200,null))
        }).on('error', err=>{
            res.status(err.code).send(response.generate(true,err,err.code,null))
        }).pipe(dest);
        res.redirect(`/drive?at=${req.auth.credentials.access_token}`)
    })
}
let uploadFile=(req,res)=>{
    /*** Need file Path to upload it on Gdrive */
    const drive = google.drive({version: 'v3', auth:req.auth});
    var fileMetadata = {
        'name': 'Uploaded.png'
      };
      var media = {
        mimeType: mime.lookup('E:/tests/Cloud Elements/Backend/downloads/img.png'),
        body: fs.createReadStream('E:/tests/Cloud Elements/Backend/downloads/img.png')
      };
      drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      }, function (err, file) {
        if (err) {
            res.status(err.code).send(response.generate(true,err,err.code,null))
        } else {
            res.status(200).send(response.generate(false,'File has been uploaded successsfully',200,null))
        }
      });
      res.redirect(`/drive?at=${req.auth.credentials.access_token}`)
}
let homepage_template=(req,res)=>{
   res.render('index');
}

module.exports={
    homepage_template:homepage_template,
    listAllFiles:listAllFiles,
    viewFolder:viewFolder,
    downloadFile:downloadFile,
    uploadFile:uploadFile
}