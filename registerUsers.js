const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');



async function main() {
 try{ 

    const ccpPath = path.resolve(__dirname, 'connection', 'connection.json');


    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const userName = 'userStudent'   
    
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);    
// Check to see if we've already enrolled the user.
const userExists = await wallet.exists(userName);
if (userExists) {
    console.log(`An identity for the user ${userName} already exists in the wallet`);
    return;
}

// Check to see if we've already enrolled the admin user.
const adminExists = await wallet.exists('admin');
if (!adminExists) {
    console.log('An identity for the admin user "admin" does not exist in the wallet');
    console.log('Run the enrollAdmin.js application before retrying');
    return;
}

// Create a new gateway for connecting to our peer node.
const gateway = new Gateway();
await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

// Get the CA client object from the gateway for interacting with the CA.
const ca = gateway.getClient().getCertificateAuthority();
const adminIdentity = gateway.getCurrentIdentity();

// Register the user, enroll the user, and import the new identity into the wallet.
const secret = await ca.register({ enrollmentID: userName , role: 'client' }, adminIdentity);
const enrollment = await ca.enroll({ enrollmentID: userName, enrollmentSecret: secret });
const userIdentity = X509WalletMixin.createIdentity('student', enrollment.certificate, enrollment.key.toBytes());
await wallet.import( userName, userIdentity);
console.log(`Successfully registered and enrolled admin user ${userName} and imported it into the wallet`);
}catch (error) {
    console.error(`Failed to register user : ${error}`);
    process.exit(1);
}
}


async function mainCollege() {
    try{ 
   
        const ccpPathCollege = path.resolve(__dirname, 'connection', 'connection1.json');
   
   
       // Create a new file system based wallet for managing identities.
       const walletPath = path.join(process.cwd(), 'wallet');
       const userName1 = 'userCollege'   
       
       const wallet = new FileSystemWallet(walletPath);
       console.log(`Wallet path: ${walletPath}`);    
   // Check to see if we've already enrolled the user.
   const userExists = await wallet.exists(userName1);
   if (userExists) {
       console.log(`An identity for the user ${userName1} already exists in the wallet`);
       return;
   }
   
   // Check to see if we've already enrolled the admin user.
   const adminExists = await wallet.exists('adminCollege');
   if (!adminExists) {
       console.log('An identity for the admin user "adminCollege" does not exist in the wallet');
       console.log('Run the enrollAdmin.js application before retrying');
       return;
   }
   
   // Create a new gateway for connecting to our peer node.
   const gateway = new Gateway();
   await gateway.connect(ccpPathCollege, { wallet, identity: 'adminCollege', discovery: { enabled: true, asLocalhost: true } });
   
   // Get the CA client object from the gateway for interacting with the CA.
   const ca = gateway.getClient().getCertificateAuthority();
   const adminIdentity = gateway.getCurrentIdentity();
   
   // Register the user, enroll the user, and import the new identity into the wallet.
   const secret = await ca.register({ enrollmentID: userName1 , role: 'client' }, adminIdentity);
   const enrollment = await ca.enroll({ enrollmentID: userName1, enrollmentSecret: secret });
   const userIdentity = X509WalletMixin.createIdentity('college', enrollment.certificate, enrollment.key.toBytes());
   await wallet.import( userName1, userIdentity);
   console.log(`Successfully registered and enrolled admin user ${userName1} and imported it into the wallet`);
   }catch (error) {
       console.error(`Failed to register user : ${error}`);
       process.exit(1);
   }
   }


   async function mainUni() {
    try{ 
   
        const ccpPathUniversity = path.resolve(__dirname, 'connection', 'connection2.json');
   
   
       // Create a new file system based wallet for managing identities.
       const walletPath = path.join(process.cwd(), 'wallet');
       const userName2 = 'userUniversity'   
       
       const wallet = new FileSystemWallet(walletPath);
       console.log(`Wallet path: ${walletPath}`);    
   // Check to see if we've already enrolled the user.
   const userExists = await wallet.exists(userName2);
   if (userExists) {
       console.log(`An identity for the user ${userName2} already exists in the wallet`);
       return;
   }
   
   // Check to see if we've already enrolled the admin user.
   const adminExists = await wallet.exists('adminUniversity');
   if (!adminExists) {
       console.log('An identity for the admin user "adminCollege" does not exist in the wallet');
       console.log('Run the enrollAdmin.js application before retrying');
       return;
   }
   
   // Create a new gateway for connecting to our peer node.
   const gateway = new Gateway();
   await gateway.connect(ccpPathUniversity, { wallet, identity: 'adminUniversity', discovery: { enabled: true, asLocalhost: true } });
   
   // Get the CA client object from the gateway for interacting with the CA.
   const ca = gateway.getClient().getCertificateAuthority();
   const adminIdentity = gateway.getCurrentIdentity();
   
   // Register the user, enroll the user, and import the new identity into the wallet.
   const secret = await ca.register({ enrollmentID: userName2 , role: 'client' }, adminIdentity);
   const enrollment = await ca.enroll({ enrollmentID: userName2, enrollmentSecret: secret });
   const userIdentity = X509WalletMixin.createIdentity('university', enrollment.certificate, enrollment.key.toBytes());
   await wallet.import( userName2, userIdentity);
   console.log(`Successfully registered and enrolled admin user ${userName2} and imported it into the wallet`);
   }catch (error) {
       console.error(`Failed to register user : ${error}`);
       process.exit(1);
   }
   }

main();
mainCollege();
mainUni();