document.addEventListener('DOMContentLoaded', async () => {
  const connectButton = document.getElementById('connectButton');
  const signMessageButton = document.getElementById('signMessageButton');
  const initiateTransactionButton = document.getElementById('initiateTransactionButton');
  const accountInfo = document.getElementById('accountInfo');
  const metamaskStatus = document.getElementById('metamaskStatus');

  let web3;
  let currentAccount;

  // Check if MetaMask is installed
  if (typeof window.ethereum === 'undefined') {
    metamaskStatus.textContent = 'MetaMask is not installed. Please install MetaMask.';
    connectButton.disabled = true;
    signMessageButton.disabled = true;
    initiateTransactionButton.disabled = true;
  } else {
    // Listen for chain changes
    window.ethereum.on('chainChanged', (chainId) => {
      if (chainId === '0x38' || chainId === '56') {
        // BSC Mainnet (0x38) or BSC Testnet (56)
        metamaskStatus.textContent = `Connected to Binance Smart Chain (${chainId === '0x38' ? 'Mainnet' : 'Testnet'})`;
      } else {
        // Switch to a different chain
        metamaskStatus.textContent = 'Please switch to Binance Smart Chain.';
      }
    });
  }

  connectButton.addEventListener('click', async () => {
    try {
      // Request account access
      await window.ethereum.enable();
      web3 = new Web3(window.ethereum);

      // Get the current account
      const accounts = await web3.eth.getAccounts();
      currentAccount = accounts[0];

      // Display the account information
      accountInfo.textContent = `Connected account: ${currentAccount}`;
      
      // Enable the sign message and initiate transaction buttons
      signMessageButton.disabled = false;
      initiateTransactionButton.disabled = false;
    } catch (error) {
      // User denied account access
      console.error('User denied account access');
    }
  });

  signMessageButton.addEventListener('click', async () => {
    if (!currentAccount) {
      console.error('No account is connected.');
      return;
    }

    // Message to be signed
    const messageToSign = 'Hello, this is a message to sign!';

    try {
      // Request user approval to sign the message
      const signature = await web3.eth.personal.sign(messageToSign, currentAccount);
      console.log('Signature:', signature);

      // Optionally, send the signature to your server
      fetch('http://localhost:3001/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: currentAccount, signature }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Server response:', data);
        })
        .catch(error => console.error('Error sending signature to server:', error));
    } catch (error) {
      console.error('Error signing message:', error);
    }
  });

  initiateTransactionButton.addEventListener('click', async () => {
    if (!currentAccount) {
      console.error('No account is connected.');
      return;
    }

    const transactionParams = {
      from: currentAccount,
      to: '0xD59F2444B0A727b28ea51eC53451E3c7cc5BD613', // Replace with the target address
      value: web3.utils.toWei('1', 'ether'), // Replace with the amount in ether
      gas: 21000, // Replace with the desired gas limit
    };

    try {
      // Request user approval to send the transaction
      const transactionHash = await web3.eth.sendTransaction(transactionParams);
      console.log('Transaction Hash:', transactionHash);
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  });
});