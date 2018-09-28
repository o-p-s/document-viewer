const {google} = require('googleapis'),credentials =require('./../config/OAuthCred'),fs =require('fs')
const UserToken=require('mongoose').model('UserToken'), check =require('./../libs/checkLib'),response =require('./../libs/responseLib')
const SCOPES = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.file'
  ];
const {client_secret, client_id, redirect_uris} = credentials;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

let isAuthorized=(req,res,next)=>{
  if(check.isEmpty(req.query.at)){
    getAccessToken(oAuth2Client);
  }else{
    UserToken.findOne({access_token:req.query.at},(err,result)=>{
      if(err)
        res.status(500).send(response.generate(true,err.error.message,500,null))
      else if(check.isEmpty(result) ||(new Date(result.expiry_date) < new Date()) ){
        result.remove((err,removed)=>{if(err) console.log('error removing previous token'+err) })
        getAccessToken(oAuth2Client);
        res.status(200).send(response.generate(false,'Token Not found or Expired',200,null))
      }else{
        oAuth2Client.setCredentials(result); 
        req.auth=oAuth2Client;
        next();
      }
    })
  }
  // // Check if we have previously stored a token.
  // fs.readFile('token.json', (err, token) => {
  //   if (err) return getAccessToken(oAuth2Client);
  //   if(new Date(JSON.parse(token).expiry_date) < new Date()){
  //     return getAccessToken(oAuth2Client);
  //   }
  //   else{
  //     oAuth2Client.setCredentials(JSON.parse(token));        
  //     req.auth=oAuth2Client;
  //     next();
  //   }
  // });

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
  function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    res.redirect(authUrl);
  }
}

let saveToken=(req,res)=>{
  oAuth2Client.getToken(req.query.code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      let userToken= new UserToken({
        access_token:token.access_token,
        scope:token.scope,
        token_type:token.token_type,
        expiry_date:token.expiry_date
      })
      userToken.save((err,savedToken)=>{
        if(err)
        console.log('error saving token')
        else{
          oAuth2Client.setCredentials(token);
          req.auth=oAuth2Client;
          res.redirect(`/drive?at=${token.access_token}`)
        }
      })

      // Store the token to disk for later program executions
      // fs.writeFile('token.json', JSON.stringify(token), (err) => {
      //   if (err) console.error(err);
      //   console.log('Token stored to', 'token.json');
      // });

    });
}
module.exports={
  saveToken:saveToken,
  isAuthorized:isAuthorized
}