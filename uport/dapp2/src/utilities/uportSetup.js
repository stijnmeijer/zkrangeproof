import { Connect, SimpleSigner } from 'uport-connect'

// Authenticate as the 'Intermediary'
const uport = new Connect('ZKdemo: intermediary (2)', {
  // account address
  clientId: '2owyiXgKKV4smUkZhSYg4wai3jjzEvq7R8z',
  // private key
  signer: SimpleSigner('5ccd3d7fd961073bacd49b06f07aa469ffdc02874b96ba1e8a02e6fc378163f6'),
  // the network the app lives on
  network: 'rinkeby'
})

// public key needed for attestation verification
const govAddress = '2ohbhSqFGj9z4VKca7BLv5KNqDGK9gtMrWL'
const govPk = '04356e44c50bda9e16bf897cb42c5fc30e9680142980e399f1575c411a109c442c4b9a5cd471dffce7af169d52eaa410d3567c27513663348c315c8c30c766443d'

const web3 = uport.getWeb3()
export { web3, uport, govAddress, govPk }
