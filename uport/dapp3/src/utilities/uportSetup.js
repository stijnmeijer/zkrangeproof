import { Connect, SimpleSigner } from 'uport-connect'
const Web3 = require('web3')

// Authenticate as the 'Relying party'
const uport = new Connect('ZKdemo: relying party (3)', {
  // account address
  clientId: '2orJJ9vJHj876EYJMHrJWnT3pg5pYiTWS8e',
  // private key
  signer: SimpleSigner('b14455cd24a2edd051070aff3fc4b84c8451e6284d3331a883a443d412aaa308'),
  // the network the app lives on
  network: 'rinkeby'
})

// public key needed for attestation verification
const govAddress = '2ohbhSqFGj9z4VKca7BLv5KNqDGK9gtMrWL'
const govPk = '04356e44c50bda9e16bf897cb42c5fc30e9680142980e399f1575c411a109c442c4b9a5cd471dffce7af169d52eaa410d3567c27513663348c315c8c30c766443d'

const web3 = uport.getWeb3()

const localWeb3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))

export { web3, uport, govAddress, govPk, localWeb3 }
