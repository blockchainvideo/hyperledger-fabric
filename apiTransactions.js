var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// Setting for Hyperledger Fabric
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const ccpPath = path.resolve(__dirname, 'connection', 'connection.json');
const ccpPathCollege = path.resolve(__dirname, 'connection', 'connection1.json');
const ccpPathUniversity = path.resolve(__dirname, 'connection', 'connection2.json');

app.get('/Query.html', async function (req, res) { 
    res.sendFile(path.join(__dirname+'/html pages/projectblockchain/Query.html'));
  
  });


  app.post('/queryPart/', async function (req, res) {
    var part = req.body.part;
    var channel= req.body.Channel;
    try {
        if(channel==="channelone"){
           //var partString = part.toString();
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        console.log();
        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('userCollege');
        if (!userExists) {
            console.log('An identity for the user "userCollege" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
  
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPathCollege, { wallet, identity: 'userCollege', discovery: { enabled: true, asLocalhost: true } });
  
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('onechannel');
  
        // Get the contract from the network.
        const contract = network.getContract('exam');
       
        // Evaluate the specified transaction.
        // queryPart transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        
        
        console.log("Quering part ID: "+ part);
        const result = await contract.evaluateTransaction('readPart', `${part}`);
        //console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        
        var resultString = result.toString();
        var objs = JSON.parse(resultString); 
        console.log(objs);
        var partClass = objs.class;
        var examRegistrationNumber = objs.examRegistrationNumber;
        var examName= objs.examName;
        var student = objs.student;
        var location =objs.location;

        res.status(200).render('home', {
                            partClass: `${partClass}`,
                            examRegistrationNumber : `${examRegistrationNumber}`,
                            examName: `${examName}`,
                            student: `${student}`,
                            location: `${location}`
                          });
  
        }
        if(channel==="channeltwo"){
                   //var partString = part.toString();
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        console.log();
        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('userCollege');
        if (!userExists) {
            console.log('An identity for the user "userCollege" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
  
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPathCollege, { wallet, identity: 'userCollege', discovery: { enabled: true, asLocalhost: true } });
  
        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('twochannel');
  
        // Get the contract from the network.
        const contract = network.getContract('grades');
        // Evaluate the specified transaction.
        // queryPart transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        
        
        console.log("Quering part ID: "+ part);
        const result = await contract.evaluateTransaction('readPart', `${part}`);
        //console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        
        var resultString = result.toString();
        var objs = JSON.parse(resultString); 
        console.log(objs);
        var partClass = objs.class;
        var examRegistrationNumber = objs.examRegistrationNumber;
        var examName= objs.examName;
        var student = objs.student;
        var grade =objs.grade ;


        //console.log(`Transaction has been evaluated, first element is: ${objs.class}`);
        res.status(200).render('home1', {
                            partClass: `${partClass}`,
                            examRegistrationNumber : `${examRegistrationNumber}`,
                            examName: `${examName}`,
                            student: `${student}`,
                            grade: `${grade}`
                          });
  
        }
       
        //res.status(200).json({response: result.toString()});
  
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({error: error});
        process.exit(1);
    }
  })


  app.post('/addexam/', async function (req, res) {
  var examRegistrationNumber = req.body.examRegistrationNumber;
  var examName = req.body.examName;
  var student= req.body.student;
  var location= req.body.location;

  const walletPath = path.join(process.cwd(), 'wallet');
  const wallet = new FileSystemWallet(walletPath);
  console.log(`Wallet path: ${walletPath}`);

  // Check to see if we've already enrolled the user.
  const userExists = await wallet.exists(`userCollege`);
  if (!userExists) {
      console.log(`An identity for the user userCollege does not exist in the wallet`);
      console.log('Run the registerUser.js application before retrying');
      return;
  }

  // Create a new gateway for connecting to our peer node.
  const gateway = new Gateway();
  await gateway.connect(ccpPathCollege, { wallet, identity: 'userCollege' , discovery: { enabled: true, asLocalhost: true } });

  // Get the network (channel) our contract is deployed to.
  const network = await gateway.getNetwork('onechannel');

  // Get the contract from the network.
  const contract = network.getContract('exam');
 
  // Submit the specified transaction.


  await contract.submitTransaction('initPart', `${examRegistrationNumber}`, `${examName}`, `${student}`,`${location}`);
  res.send('Transaction has been submitted');

  // Disconnect from the gateway.
  await gateway.disconnect();


  })

 

  app.get('/CreateExam.html', async function (req, res) { 

    res.sendFile(path.join(__dirname+'/html pages/projectblockchain/Create.html'));
  
  });



var port = 8000;
app.listen(port, function() {
    console.log('Listening on port ' + port);
  });
