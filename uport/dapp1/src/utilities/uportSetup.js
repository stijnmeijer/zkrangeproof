import { Connect, SimpleSigner } from 'uport-connect'

// Authenticate as the 'Issuer'
const uport = new Connect('ZKdemo: issuer (1)', {
  // account address
  clientId: '2ohbhSqFGj9z4VKca7BLv5KNqDGK9gtMrWL',
  // private key
  signer: SimpleSigner('860661f2fcec235dfee4ffb2f972972d96504e2bf5c4f850fb8bca06e7c94df6'),
  // the network the app lives on
  network: 'rinkeby'
})

// public key needed for attestation verification
const pk = '04356e44c50bda9e16bf897cb42c5fc30e9680142980e399f1575c411a109c442c4b9a5cd471dffce7af169d52eaa410d3567c27513663348c315c8c30c766443d'

const web3 = uport.getWeb3()
export { web3, uport, pk }
